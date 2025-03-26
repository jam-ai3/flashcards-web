import db from "@/db/db";
import { MONTH_IN_MS, PRODUCTS, YEAR_IN_MS } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_API_KEY!);

export async function POST(req: NextRequest) {
  const event = stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get("stripe-signature") as string,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  if (event.type === "checkout.session.completed") {
    const charge = event.data.object as Stripe.Checkout.Session;
    const { userId, productId } = charge.metadata ?? {};
    if (!userId || !productId) {
      console.error("Missing metadata");
      return new NextResponse(null, { status: 400 });
    }

    let code: string | undefined;
    const total = charge.amount_total ?? 0;

    if (
      (charge.total_details?.amount_discount ?? 0) > 0 &&
      charge.discounts?.[0]
    ) {
      const promoCodeId = charge.discounts[0].promotion_code;
      if (!promoCodeId) return new NextResponse(null, { status: 400 });
      const promoCode = await stripe.promotionCodes.retrieve(
        promoCodeId as string
      );
      code = promoCode.code;
    }

    const stripeId = charge.subscription as string | undefined;

    switch (productId) {
      case PRODUCTS.single.id:
        await handleSinglePayment(userId, total, code);
        break;
      case PRODUCTS.monthly.id:
        if (!stripeId) return new NextResponse(null, { status: 400 });
        await handleMonthlyPayment(userId, stripeId, total, code);
        break;
      case PRODUCTS.yearly.id:
        if (!stripeId) return new NextResponse(null, { status: 400 });
        await handleYearlyPayment(userId, stripeId, total, code);
        break;
    }
  } else if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    const promoCodeId = invoice.discount?.promotion_code;
    const promoCode = await stripe.promotionCodes.retrieve(
      promoCodeId as string
    );
    const code = promoCode.code;
    const subscriptionId = invoice.subscription as string | undefined;
    if (!subscriptionId) return new NextResponse(null, { status: 400 });
    const result = await handleSubscriptionRenewal(
      subscriptionId,
      invoice.total,
      code
    );
    if (result === "error") {
      return new NextResponse(null, { status: 400 });
    }
  } else {
    console.error(`Unhandled event type: ${event.type}`);
    return new NextResponse(null, { status: 400 });
  }

  return new NextResponse(null, { status: 200 });
}

async function handleSinglePayment(
  userId: string,
  total: number,
  couponCode?: string
) {
  await Promise.all([
    db.sale.create({
      data: {
        userId,
        productId: PRODUCTS.single.id,
        pricePaidInPennies: total,
        couponCode,
      },
    }),
    db.user.update({
      where: { id: userId },
      data: { paidGenerates: { increment: 1 } },
    }),
  ]);
}

async function handleMonthlyPayment(
  userId: string,
  stripeId: string,
  total: number,
  couponCode?: string
) {
  const existing = await db.subscription.findUnique({
    where: { userId },
    select: { expiresAt: true },
  });
  const existingExpiresAt = existing?.expiresAt.getTime() ?? 0;
  const startDate =
    existingExpiresAt > Date.now() ? existingExpiresAt : Date.now();
  const newExpiresAt = new Date(startDate + MONTH_IN_MS);
  console.log(newExpiresAt.toLocaleString());
  await Promise.all([
    db.sale.create({
      data: {
        userId,
        productId: PRODUCTS.monthly.id,
        pricePaidInPennies: total,
        couponCode,
      },
    }),
    db.subscription.upsert({
      where: { userId },
      update: {
        type: "Monthly",
        expiresAt: newExpiresAt,
        isActive: true,
        generatesUsed: 0,
      },
      create: {
        userId,
        type: "Monthly",
        expiresAt: newExpiresAt,
        stripeId,
      },
    }),
  ]);
}

async function handleYearlyPayment(
  userId: string,
  stripeId: string,
  total: number,
  couponCode?: string
) {
  const existing = await db.subscription.findUnique({
    where: { userId },
    select: { expiresAt: true },
  });
  const existingExpiresAt = existing?.expiresAt.getTime() ?? 0;
  const startDate =
    existingExpiresAt > Date.now() ? existingExpiresAt : Date.now();
  const newExpiresAt = new Date(startDate + YEAR_IN_MS);
  await Promise.all([
    db.sale.create({
      data: {
        userId,
        productId: PRODUCTS.yearly.id,
        pricePaidInPennies: total,
        couponCode,
      },
    }),
    db.subscription.upsert({
      where: { userId },
      update: {
        type: "Yearly",
        expiresAt: newExpiresAt,
        isActive: true,
        generatesUsed: 0,
      },
      create: {
        userId,
        type: "Yearly",
        expiresAt: newExpiresAt,
        stripeId,
      },
    }),
  ]);
}

async function handleSubscriptionRenewal(
  stripeId: string,
  discount: number,
  couponCode?: string
) {
  const existing = await db.subscription.findUnique({
    where: { stripeId },
  });
  if (!existing) return "error";
  if (existing.type === "Monthly") {
    await db.subscription.update({
      where: { stripeId },
      data: { expiresAt: new Date(Date.now() + MONTH_IN_MS) },
    });
  } else if (existing.type === "Yearly") {
    await db.subscription.update({
      where: { stripeId },
      data: { expiresAt: new Date(Date.now() + YEAR_IN_MS) },
    });
  }
  await db.sale.create({
    data: {
      userId: existing.userId,
      productId:
        existing.type === "Monthly" ? PRODUCTS.monthly.id : PRODUCTS.yearly.id,
      pricePaidInPennies:
        (existing.type === "Monthly"
          ? PRODUCTS.monthly.priceInPennies
          : PRODUCTS.yearly.priceInPennies) - discount,
      couponCode,
    },
  });
  return "success";
}
