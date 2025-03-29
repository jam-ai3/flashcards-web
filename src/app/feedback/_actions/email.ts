"use client";

import { z } from "zod";
import emailjs from "@emailjs/browser";

const emailFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});

export async function sendEmail(_: unknown, data: FormData) {
  const result = emailFormSchema.safeParse(Object.fromEntries(data.entries()));
  if (!result.success) return result.error.formErrors.fieldErrors;
  const { name, email, message } = result.data;

  try {
    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAIL_JS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAIL_JS_TEMPLATE_ID!,
      { name, email, message },
      process.env.NEXT_PUBLIC_EMAIL_JS_PUBLIC_KEY!
    );
  } catch {
    return { error: "Failed to send email" };
  }

  return { error: undefined };
}
