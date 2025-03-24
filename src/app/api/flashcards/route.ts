import db from "@/db/db";
import { PaymentType } from "@/lib/types";
import { isError } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

type RawFlashcard = {
  front: string;
  back: string;
};

export async function POST(req: NextRequest) {
  const json = await req.json();
  const {
    userId,
    groupId,
    flashcards,
    inputType,
    inputFormat,
    paymentType,
    prompt,
  } = json;

  if (isError(flashcards)) {
    await db.flashcardGroup.create({
      data: {
        userId,
        id: groupId,
        paymentType,
        inputFormat,
        inputType,
        error: flashcards.devError ?? flashcards.error,
        prompt,
      },
    });
  } else {
    await db.flashcardGroup.create({
      data: {
        userId,
        id: groupId,
        paymentType,
        inputFormat,
        inputType,
        error: null,
        prompt,
      },
    });
    await db.flashcard.createMany({
      data: (flashcards as RawFlashcard[]).map((f) => ({
        front: f.front,
        back: f.back,
        groupId,
      })),
    });
    await chargeUser(userId, paymentType);
  }

  return new NextResponse("Success", { status: 200 });
}

async function chargeUser(userId: string, paymentType: PaymentType) {
  switch (paymentType) {
    case "free":
      await db.user.update({
        where: { id: userId },
        data: { freeGenerates: { decrement: 1 } },
      });
      break;
    case "single":
      await db.user.update({
        where: { id: userId },
        data: { paidGenerates: { decrement: 1 } },
      });
      break;
    case "subscription":
      await db.subscription.update({
        where: { userId },
        data: { generatesUsed: { increment: 1 } },
      });
      break;
  }
}
