"use server";

import db from "@/db/db";
import { CustomError } from "@/lib/utils";
import {
  InputFormat,
  InputType,
  PaymentResult,
  RawFlashcard,
} from "@/lib/types";
import { redirect } from "next/navigation";

type PaymentType = "free" | "single" | "subscription";

export async function getPaymentOptions(
  userId: string
): Promise<PaymentResult | CustomError> {
  const [subscription, user] = await Promise.all([
    db.subscription.findUnique({
      where: { userId },
      select: { type: true, expiresAt: true, generatesUsed: true },
    }),
    db.user.findUnique({
      where: { id: userId },
      select: { freeTrialStart: true },
    }),
  ]);

  if (!user) return { error: "User not found" };

  // all generations are free
  // const subscriptionType =
  //   subscription && subscription.expiresAt.getTime() > Date.now()
  //     ? "subscription"
  //     : isFreeTrialActive(user)
  //     ? "free"
  //     : null;
  const subscriptionType = "subscription";

  return {
    subscriptionType,
    subscriptionGeneratesUsed: subscription?.generatesUsed ?? null,
  };
}

export async function createFlashcards(
  groupId: string,
  userId: string,
  paymentType: PaymentType,
  inputType: InputType,
  inputFormat: InputFormat,
  prompt: string,
  flashcards: RawFlashcard[]
) {
  try {
    await db.flashcardGroup.create({
      data: {
        id: groupId,
        userId,
        paymentType,
        inputType,
        inputFormat,
        prompt,
      },
    });
    await db.flashcard.createMany({
      data: flashcards.map((f) => ({
        ...f,
        groupId,
      })),
    });
  } catch (error) {
    console.error(error);
    return {
      error: "",
      devError: `Failed to create flashcards in database error: ${error}`,
    };
  }
}

export async function serverRedirect(url: string) {
  redirect(url);
}
