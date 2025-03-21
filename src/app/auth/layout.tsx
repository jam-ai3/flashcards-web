import db from "@/db/db";
import { getSession } from "@/lib/auth";
import { AUTH_REDIRECT_PATH } from "@/lib/constants";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.id) return children;
  const user = await db.user.findUnique({ where: { id: session?.id } });
  if (!user) return children;

  return redirect(AUTH_REDIRECT_PATH);
}
