"use server";

import { z } from "zod";
import db from "@/db/db";
import { CustomError, isError } from "@/lib/utils";
import { InputFormat, InputType } from "@/lib/types";

const generateSchema = z.object({
  format: z.enum(["text", "pdf", "pptx", "image"]).default("text"),

  text: z.string().optional(),
  pdf: z.instanceof(File).optional(),
  pptx: z.instanceof(File).optional(),
  image: z.instanceof(File).optional(),

  university: z.string().optional(),
  department: z.string().optional(),
  courseNumber: z.string().optional(),
  courseName: z.string().optional(),
});

type PaymentResult = {
  subscriptionType: string | null;
  subscriptionExpiresAt: Date | null;
  subscriptionGeneratesUsed: number | null;
  freeGenerates: number;
  paidGenerates: number;
};

type PaymentType = "free" | "single" | "subscription";

// TODO: throw on file too large
export async function handleGenerate(
  groupId: string,
  userId: string,
  inputType: InputType,
  _: unknown,
  data: FormData
) {
  try {
    // parse form data
    const result = generateSchema.safeParse(Object.fromEntries(data.entries()));
    if (!result.success) return result.error.formErrors.fieldErrors;

    // check user's payment options
    const paymentOptions = await getPaymentOptions(userId);
    if (isError(paymentOptions)) return paymentOptions;

    // choose payment type
    const paymentType = getPaymentType(paymentOptions);
    if (isError(paymentType)) return paymentType;

    const courseInfo =
      inputType === "courseInfo"
        ? JSON.stringify({
            university: result.data.university,
            department: result.data.department,
            courseNumber: result.data.courseNumber,
            courseName: result.data.courseName,
          })
        : undefined;

    // send request to server to generate flashcards
    const cards = await generateFlashcards({
      inputType,
      inputFormat: result.data.format,
      paymentType,
      groupId,
      userId,
      text: result.data.text,
      pdf: result.data.pdf,
      pptx: result.data.pptx,
      image: result.data.image,
      courseInfo,
    });
    if (isError(cards)) return cards;

    return { error: undefined };
  } catch (error) {
    console.error(error);
    return {
      error: "An unknown error occurred, please refresh the page and try again",
    };
  }
}

async function getPaymentOptions(
  userId: string
): Promise<PaymentResult | CustomError> {
  const [subscription, user] = await Promise.all([
    db.subscription.findUnique({
      where: { userId },
      select: { type: true, expiresAt: true, generatesUsed: true },
    }),
    db.user.findUnique({
      where: { id: userId },
      select: { freeGenerates: true, paidGenerates: true },
    }),
  ]);

  if (!user) {
    return { error: "User not found" };
  }

  return {
    subscriptionType: subscription?.type ?? null,
    subscriptionExpiresAt: subscription?.expiresAt ?? null,
    subscriptionGeneratesUsed: subscription?.generatesUsed ?? null,
    freeGenerates: user.freeGenerates,
    paidGenerates: user.paidGenerates,
  };
}

function getPaymentType(payment: PaymentResult): PaymentType | CustomError {
  if (payment.subscriptionType) {
    return "subscription";
  } else if (payment.paidGenerates > 0) {
    return "single";
  } else if (payment.freeGenerates > 0) {
    return "free";
  }
  return { error: "No payment options available" };
}

type GenerateArgs = {
  inputType: InputType;
  inputFormat: InputFormat;
  paymentType: PaymentType;
  groupId: string;
  userId: string;
  text?: string;
  pdf?: File;
  pptx?: File;
  image?: File;
  courseInfo?: string;
};

async function generateFlashcards({
  inputType,
  inputFormat,
  paymentType,
  groupId,
  userId,
  text,
  pdf,
  pptx,
  image,
  courseInfo,
}: GenerateArgs): Promise<string | CustomError> {
  try {
    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        inputType,
        inputFormat,
        paymentType,
        groupId,
        userId,
      })
    );
    if (text) formData.append("text", text);
    if (pdf) formData.append("pdf", pdf);
    if (pptx) formData.append("pptx", pptx);
    if (image) formData.append("image", image);
    if (courseInfo) formData.append("courseInfo", courseInfo);

    const res = await fetch(`${process.env.PYTHON_SERVER_URL}/generate`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${process.env.PYTHON_SERVER_API_KEY}`,
      },
    });
    if (!res.ok) {
      const json = await res.json();
      return {
        error: "Failed to generate flashcards",
        devError: json.devError ?? json.error,
      };
    }
    return await res.json();
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to generate flashcards",
      devError: "Server failed to generate response",
    };
  }
}

// Used for polling
export async function getFlashcardGroup(groupId: string) {
  const group = await db.flashcardGroup.findUnique({
    where: { id: groupId },
    select: { id: true },
  });
  return group !== null;
}
