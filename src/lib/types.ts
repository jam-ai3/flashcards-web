export type InputType = "notes" | "syllabus" | "courseInfo";
export type InputFormat = "text" | "pdf" | "pptx" | "image";
export type PaymentType = "free" | "single" | "subscription";
export type Status = "success" | "error";
export type RawFlashcard = {
  front: string;
  back: string;
};
