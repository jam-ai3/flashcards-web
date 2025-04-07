import { Button } from "@/components/ui/button";
import db from "@/db/db";
import { getSession } from "@/lib/auth";
import { LANDING_PAGE_URL } from "@/lib/constants";
import { ArrowRight, CircleCheck, CircleX } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function GroupsPage() {
  const session = await getSession();
  if (!session) redirect(LANDING_PAGE_URL);
  const groups = await db.flashcardGroup.findMany({
    where: { userId: session.id },
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
    <ul className="flex flex-col gap-2">
      {groups.map((group, index) => (
        <Link key={group.id} href={`/flashcards/${group.id}`}>
          <li className="flex justify-between items-center rounded-md border bg-secondary py-2 px-4 text-primary">
            <div>
              <p className="font-semibold">Generation #{index + 1}</p>
              <p className="text-muted-foreground">
                {group.createdAt.toLocaleString()}
              </p>
            </div>
            {group.error === null ? (
              <CircleCheck />
            ) : (
              <CircleX className="text-destructive" />
            )}
          </li>
        </Link>
      ))}
    </ul>
  );
}
