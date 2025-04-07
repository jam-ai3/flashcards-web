export type InputType = "notes" | "syllabus" | "courseInfo";
export type InputFormat = "text" | "pdf" | "pptx" | "image";
export type PaymentType = "free" | "subscription";
export type Status = "success" | "error";

export type RawFlashcard = {
  front: string;
  back: string;
};

export type PaymentResult = {
  subscriptionType: "free" | "subscription" | null;
  subscriptionGeneratesUsed: number | null;
};

export type Session = {
  id: string;
  email: string;
  isAdmin: boolean;
};
