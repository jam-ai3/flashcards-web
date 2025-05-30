"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MAX_FREE_TIER_FLASHCARDS } from "@/lib/constants";
import { exportCsv } from "@/lib/utils";
import { Flashcard, FlashcardGroup } from "@prisma/client";
import {
  ArrowLeft,
  Book,
  Circle,
  CircleCheck,
  Info,
  Share,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { deleteFlashcards } from "../../_actions/flashcard";
import { useRouter } from "next/navigation";

type FlashcardGridProps = {
  group: FlashcardGroup;
  flashcards: Flashcard[];
};

export default function FlashcardGrid({
  group,
  flashcards,
}: FlashcardGridProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Flashcard[]>([]);

  function toggleSelectAll() {
    if (selected.length === flashcards.length) {
      setSelected([]);
    } else {
      setSelected(flashcards);
    }
  }

  function toggleSelect(flashcard: Flashcard) {
    if (selected.includes(flashcard)) {
      setSelected(selected.filter((f) => f !== flashcard));
    } else {
      setSelected([...selected, flashcard]);
    }
  }

  async function handleDelete() {
    try {
      await deleteFlashcards(selected);
      router.refresh();
    } catch {}
  }

  function handleExport() {
    const csv = selected.map((f) => `"${f.front}","${f.back}"`).join("\n");
    exportCsv(csv);
  }

  return (
    <>
      <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-4">
        <div>
          <div className="flex gap-2">
            <Link href="/flashcards" className="flex items-center gap-2">
              <ArrowLeft className="text-muted-foreground" size={16} />
              <span>Flashcard Decks</span>
            </Link>
          </div>
          {group.paymentType === "free" && (
            <div className="flex items-center gap-2 text-yellow-500">
              <Info />
              <p>
                Flashcards generated using free trial are limited to a maximum
                of {MAX_FREE_TIER_FLASHCARDS}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost">
            <Link href={`/study/${group.id}`}>
              <Book className="text-primary" />
              <span className="text-primary">Study</span>
            </Link>
          </Button>
          <Button onClick={toggleSelectAll} variant="ghost">
            <span>
              {selected.length} / {flashcards.length}
            </span>
            <span>
              {selected.length === flashcards.length
                ? "Deselect All"
                : "Select All"}
            </span>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" disabled={selected.length === 0}>
                <Trash />
                <span>Delete</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Flashcards</DialogTitle>
                <DialogDescription>
                  Delete {selected.length} flashcard
                  {selected.length === 1 ? "" : "s"}?
                </DialogDescription>
              </DialogHeader>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogContent>
          </Dialog>
          <Button onClick={handleExport}>
            <Share />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>
      {group.error ? (
        <div className="place-items-center grid h-full">
          <div className="flex flex-col items-center gap-2">
            <p className="font-semibold text-xl">
              There was an error generating your flashcards
            </p>
            <p className="text-muted-foreground">
              You were not charged for this attempt
            </p>
          </div>
        </div>
      ) : (
        <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pb-6">
          {flashcards.map((flashcard) => (
            <FlashcardView
              key={flashcard.id}
              flashcard={flashcard}
              isSelected={selected.includes(flashcard)}
              handleSelect={toggleSelect}
            />
          ))}
        </div>
      )}
    </>
  );
}

type FlashcardViewProps = {
  flashcard: Flashcard;
  isSelected: boolean;
  handleSelect: (flashcard: Flashcard) => void;
};

const CIRCLE_SIZE = 16;

function FlashcardView({
  flashcard,
  isSelected,
  handleSelect,
}: FlashcardViewProps) {
  return (
    <Card
      onClick={handleSelect.bind(null, flashcard)}
      className="relative cursor-pointer"
    >
      <CardContent className="space-y-4">
        <div className="top-2 right-2 absolute accent-accent">
          {isSelected ? (
            <CircleCheck size={CIRCLE_SIZE} />
          ) : (
            <Circle size={CIRCLE_SIZE} className="text-muted-foreground" />
          )}
        </div>
        <p>{flashcard.front}</p>
        <div className="bg-muted w-full h-px" />
        <p>{flashcard.back}</p>
      </CardContent>
    </Card>
  );
}

// function formatPaymentString(paymentType: string | null) {
//   switch (paymentType) {
//     case "free":
//       return "Flashcards generated with free trial";
//     case "single":
//       return "Flashcards generated with single payment";
//     case "subscription":
//       return "Flashcards generated with subscription";
//     case null:
//       return "An error occured while generating flashcards, you have not been charged";
//     default:
//       return "Flashcards generated with unknown payment type";
//   }
// }
