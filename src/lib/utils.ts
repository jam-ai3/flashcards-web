import { Subscription, User } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FREE_TRIAL_ENDS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type CustomError = {
  error: string;
  devError?: string;
};

export function isError<T>(response: T | CustomError): response is CustomError {
  return (
    typeof response === "object" && response !== null && "error" in response
  );
}

export function exportCsv(string: string) {
  const blob = new Blob([string], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "export.csv";
  a.click();
}

export async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatPrice(priceInPennies: number) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(priceInPennies / 100);
}

export function formatNumber(num: number) {
  const formatter = new Intl.NumberFormat("en-US");
  return formatter.format(num);
}

export function isSubscribed(user: User, subscription: Subscription | null) {
  return (
    (subscription && subscription.expiresAt.getTime() > Date.now()) ||
    isFreeTrialActive(user)
  );
}

type PartialUser = {
  freeTrialStart: Date | null;
};

export function isFreeTrialActive(user: PartialUser) {
  return user.freeTrialStart && Date.now() < FREE_TRIAL_ENDS.getTime();
}
