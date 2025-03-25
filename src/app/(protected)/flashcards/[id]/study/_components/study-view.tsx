"use client";

import { Button } from "@/components/ui/button";
import { Flashcard } from "@prisma/client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

type StudyViewProps = {
  flashcards: Flashcard[];
};

export default function StudyView({ flashcards }: StudyViewProps) {
  const [index, setIndex] = useState(0);

  function handleBack() {
    if (index !== 0) setIndex(index - 1);
  }

  function handleNext() {
    if (index < flashcards.length - 1) setIndex(index + 1);
  }

  return (
    <div className="grid place-items-center h-full">
      <FlashcardView flashcard={flashcards[index]} />
      <div className="absolute bottom-8 w-3/4 flex justify-between">
        <Button onClick={handleBack} disabled={index <= 0}>
          <ArrowLeft />
          <span>Back</span>
        </Button>
        <p>
          {index + 1}/{flashcards.length}
        </p>
        <Button onClick={handleNext} disabled={index >= flashcards.length - 1}>
          <span>Next</span>
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

type FlashcardViewProps = {
  flashcard: Flashcard;
};

function FlashcardView({ flashcard }: FlashcardViewProps) {
  const [side, setSide] = useState<"front" | "back">("front");

  return (
    <div
      onClick={() => setSide(side === "front" ? "back" : "front")}
      className="border-2 rounded-xl aspect-video w-1/2 grid place-items-center cursor-pointer p-6"
    >
      <p className="text-lg text-center">
        {side === "front" ? flashcard.front : flashcard.back}
      </p>
    </div>
  );
}
