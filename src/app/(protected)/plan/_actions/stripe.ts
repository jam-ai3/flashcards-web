"use server";

import db from "@/db/db";
import { Product } from "@/lib/constants";
import { redirect } from "next/navigation";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_API_KEY!);

export async function createCheckoutSession(product: Product, userId: string) {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
          },
          unit_amount: product.priceInPennies,
          recurring: product.isSubscription
            ? { interval: product.subscriptionInterval }
            : undefined,
        },
        quantity: 1,
      },
    ],
    mode: product.isSubscription ? "subscription" : "payment",
    success_url: `${process.env.SERVER_URL!}/home`,
    cancel_url: `${process.env.SERVER_URL!}/payment/failure?productId=${
      product.id
    }`,
    payment_method_types: ["card"],
    metadata: {
      productId: product.id,
      userId,
    },
  });

  return session.url;
}

export async function cancelSubscription(stripeId: string) {
  try {
    await stripe.subscriptions.update(stripeId, {
      cancel_at_period_end: true,
    });
    await db.subscription.update({
      where: { stripeId },
      data: { isActive: false },
    });
    redirect("/plan");
  } catch (error) {
    console.error(error);
  }
}
