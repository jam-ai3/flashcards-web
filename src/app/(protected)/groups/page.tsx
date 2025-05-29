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
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!groups || groups.length === 0) {
    return (
      <div className="place-items-center grid h-full">
        <div className="flex flex-col items-center gap-4">
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
          className="flex justify-between items-center bg-secondary px-4 py-2 border rounded-md text-primary"
        >
          <Link href={`/flashcards/${group.id}`}>
            <div className="flex items-center gap-4">
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
