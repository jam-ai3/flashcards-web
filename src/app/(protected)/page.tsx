import GenerateForm from "./_components/generate-form";
import { redirect } from "next/navigation";
import { UNAUTH_REDIRECT_PATH } from "@/lib/constants";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect(UNAUTH_REDIRECT_PATH);

  return (
    <div className="grid grid-cols-2 h-full">
      <section className="flex flex-col gap-4 justify-center items-center">
        <h2 className="font-semibold text-2xl">Generate flashcards</h2>
        <p className="text-center w-3/4 text-muted-foreground">
          Upload your notes, syllabus, or some information about your course to
          get started generating flashcards.
        </p>
      </section>
      <section className="grid items-center">
        <GenerateForm userId={session.id} />
      </section>
    </div>
  );
}
