import { getSession } from "@/lib/auth";
import ClientHeader from "./client-header";

export default async function Header() {
  const session = await getSession();

  return <ClientHeader session={session} />;
}
