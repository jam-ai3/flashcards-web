"use server";

import db from "@/db/db";
import { Flashcard } from "@prisma/client";

export async function deleteFlashcards(flashcards: Flashcard[]) {
  await db.flashcard.deleteMany({
    where: { id: { in: flashcards.map((f) => f.id) } },
  });
}
