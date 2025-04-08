import { Button } from "@/components/ui/button";
import db from "@/db/db";
import { getSession } from "@/lib/auth";
import { LANDING_PAGE_URL } from "@/lib/constants";
import { ArrowRight, CircleCheck, CircleX } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteButton from "./_components/delete-btn";

export default async function GroupsPage() {
  const session = await getSession();
  if (!session) redirect(LANDING_PAGE_URL);
  const groups = await db.flashcardGroup.findMany({
    where: { userId: session.id },
    select: {
      id: true,
      error: true,
      createdAt: true,
      _count: {
        select: {
          cards: true,
        },
      },
    },
  });

  if (!groups || groups.length === 0) {
    return (
      <div className="h-full grid place-items-center">
        <div className="flex flex-col gap-4 items-center">
          <p className="font-semibold text-lg">No Flashcard Sets Created</p>
          <p className="text-muted-foreground text-center">
            Click the button below to get started
          </p>
          <Button asChild variant="accent">
            <Link href="/">
              <span>Generate Flashcards</span>
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2 pb-4">
      {groups.map((group, index) => (
        <li
          key={group.id}
          className="flex justify-between items-center rounded-md border bg-secondary py-2 px-4 text-primary"
        >
          <Link href={`/flashcards/${group.id}`}>
            <div className="flex gap-4 items-center">
              {group.error === null ? (
                <CircleCheck />
              ) : (
                <CircleX className="text-destructive" />
              )}
              <div>
                <p className="font-semibold">
                  Generation #{index + 1} - {group._count.cards} cards
                </p>
                <p className="text-muted-foreground">
                  {group.createdAt.toLocaleString()}
                </p>
              </div>
            </div>
          </Link>
          <DeleteButton groupId={group.id} />
        </li>
      ))}
    </ul>
  );
}
