import db from "@/db/db";
import StudyView from "./_components/study-view";

type StudyPageProps = {
  params: Promise<{ id: string }>;
};

export default async function StudyPage({ params }: StudyPageProps) {
  const { id } = await params;
  const flashcards = await db.flashcard.findMany({ where: { groupId: id } });

  return <StudyView flashcards={flashcards} />;
}
