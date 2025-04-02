"use client";

import {
  InputFormat,
  InputType,
  PaymentResult,
  PaymentType,
  RawFlashcard,
} from "@/lib/types";
import { z } from "zod";
import {
  createFlashcards,
  getPaymentOptions,
  serverRedirect,
} from "./generate";
import { CustomError, isError } from "@/lib/utils";

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

    // generate flashcards
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

    const res = await createFlashcards(
      groupId,
      userId,
      paymentType,
      inputType,
      result.data.format,
      "prompt",
      cards
    );
    if (isError(res)) return res;

    await serverRedirect(`/flashcards/${groupId}`);

    // unreachable
    return { error: undefined };
  } catch (error) {
    console.error(error);
    return {
      error: `An unknown error occurred, please refresh the page and try again, error: ${error}`,
    };
  }
}

function getPaymentType(payment: PaymentResult): PaymentType | CustomError {
  return payment.subscriptionType !== null
    ? payment.subscriptionType
    : { error: "No active subscription, please check your account page" };
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
}: GenerateArgs): Promise<RawFlashcard[] | CustomError> {
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

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_PYTHON_SERVER_URL}/generate`,
      {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PYTHON_SERVER_API_KEY}`,
        },
      }
    );
    if (!res.ok) {
      const json = await res.json();
      return {
        error:
          json.error ?? "Failed to generate flashcards, please try again later",
        devError: json.devError ?? json.error,
      };
    }
    return await res.json();
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to generate flashcards, please try again later",
      devError: "Server failed to generate response",
    };
  }
}
