"use server";

import { z } from "zod";
import db from "@/db/db";
import { Error, isError } from "@/lib/utils";
import { InputFormat, InputType } from "@/lib/types";

const generateSchema = z.object({
  format: z.enum(["text", "pdf", "pptx"]).default("text"),

  notesText: z.string().optional(),
  notesPdf: z.instanceof(File).optional(),
  notesPptx: z.instanceof(File).optional(),

  syllabusText: z.string().optional(),
  syllabusPdf: z.instanceof(File).optional(),
  syllabusPptx: z.instanceof(File).optional(),

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

export async function handleGenerate(
  groupId: string,
  userId: string,
  inputType: InputType,
  _: unknown,
  data: FormData
) {
  // parse form data
  const result = generateSchema.safeParse(Object.fromEntries(data.entries()));
  if (!result.success) {
    console.error(result.error);
    return result.error.formErrors.fieldErrors;
  }

  // get text prompt from python server if pdf or pptx
  const text = await formatText(inputType, result.data);
  if (isError(text)) return text;

  // check user's payment options
  const paymentOptions = await getPaymentOptions(userId);
  if (isError(paymentOptions)) return paymentOptions;

  // choose payment type
  const paymentType = getPaymentType(paymentOptions);
  if (isError(paymentType)) return paymentType;

  // send request to server to generate flashcards
  const cards = await generateFlashcards(
    text,
    inputType,
    result.data.format,
    paymentType,
    groupId,
    userId
  );
  if (isError(cards)) return cards;

  return { error: undefined };
}

async function formatText(
  inputType: InputType,
  data: z.infer<typeof generateSchema>
): Promise<string | Error> {
  const format = data.format;
  let text;
  if (format === "text") {
    text =
      inputType === "courseInfo"
        ? JSON.stringify({
            university: data.university,
            department: data.department,
            courseNumber: data.courseNumber,
            courseName: data.courseName,
          })
        : inputType === "notes"
        ? data.notesText
        : data.syllabusText;
  } else if (data.notesPdf) {
    text = await parseFile(data.notesPdf, format);
  } else if (data.notesPptx) {
    text = await parseFile(data.notesPptx, format);
  } else if (data.syllabusPdf) {
    text = await parseFile(data.syllabusPdf, format);
  } else if (data.syllabusPptx) {
    text = await parseFile(data.syllabusPptx, format);
  }
  if (text === undefined) {
    return { error: "Invalid input format" };
  }
  return text;
}

async function parseFile(
  file: File,
  format: "pdf" | "pptx"
): Promise<string | Error> {
  try {
    const formData = new FormData();
    formData.append(format, file);
    const res = await fetch(`${process.env.PYTHON_SERVER_URL}/${format}`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const json = await res.json();
      return {
        error: "Failed to parse file",
        devError: json.devError ?? json.error,
      };
    }
    return await res.json();
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to parse file, please make sure it is not over 10MB",
      devError: error as string,
    };
  }
}

async function getPaymentOptions(
  userId: string
): Promise<PaymentResult | Error> {
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

function getPaymentType(payment: PaymentResult): PaymentType | Error {
  if (payment.subscriptionType) {
    return "subscription";
  } else if (payment.paidGenerates > 0) {
    return "single";
  } else if (payment.freeGenerates > 0) {
    return "free";
  }
  return { error: "No payment options available" };
}

async function generateFlashcards(
  text: string,
  inputType: InputType,
  inputFormat: InputFormat,
  paymentType: PaymentType,
  groupId: string,
  userId: string
): Promise<string | Error> {
  try {
    const res = await fetch(`${process.env.PYTHON_SERVER_URL}/generate`, {
      method: "POST",
      body: JSON.stringify({
        text,
        inputType,
        inputFormat,
        paymentType,
        groupId,
        userId,
      }),
      headers: {
        Authorization: `Bearer ${process.env.PYTHON_SERVER_API_KEY}`,
        "Content-Type": "application/json",
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

export async function getFlashcardGroup(groupId: string) {
  const group = await db.flashcardGroup.findUnique({
    where: { id: groupId },
    select: { id: true },
  });
  return group !== null;
}
