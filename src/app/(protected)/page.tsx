import GenerateForm from "./_components/generate-form";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LANDING_PAGE_URL } from "@/lib/constants";

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect(LANDING_PAGE_URL);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
      <section className="flex flex-col gap-4 justify-center items-center">
        <h2 className="font-semibold text-2xl lg:text-4xl">
          Generate flashcards
        </h2>
        <p className="text-center w-3/4 text-muted-foreground text-md lg:text-lg">
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
