import { getSession } from "@/lib/auth";
import ClientPage from "./_components/client-page";
import Header from "@/components/header/header";

export default async function HomePage() {
  const session = await getSession();

  return (
    <main className="flex flex-col gap-6 p-8 min-h-screen lg:h-screen overflow-hidden">
      <Header />
      <ClientPage session={session} />
    </main>
  );
}
