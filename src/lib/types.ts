export type InputType = "notes" | "syllabus" | "courseInfo";
export type InputFormat = "text" | "pdf" | "pptx" | "image";
export type PaymentType = "free" | "single" | "subscription";
export type Status = "success" | "error";
export type RawFlashcard = {
  front: string;
  back: string;
};
export type PaymentResult = {
  subscriptionType: string | null;
  subscriptionExpiresAt: Date | null;
  subscriptionGeneratesUsed: number | null;
  freeGenerates: number;
  paidGenerates: number;
};
