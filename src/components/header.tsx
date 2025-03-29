import { getSession } from "@/lib/auth";
import Link from "next/link";
import NavbarLink from "./navbar-link";

export default async function Header() {
  const session = await getSession();

  return (
    <nav className="flex justify-between">
      <Link href="/">
        <h1 className="font-bold text-2xl text-primary">
          Flashcards Generator
        </h1>
      </Link>
      <div className="flex gap-8">
        {/* <NavbarLink href="/about" title="About" /> */}
        <NavbarLink href="/feedback" title="Feedback" />
        {session ? (
          <>
            <NavbarLink href="/groups" title="Flashcards" />
            <NavbarLink href="/account" title="Account" />
          </>
        ) : (
          <>
            <NavbarLink href="/auth/login" title="Login" />
            <NavbarLink href="/auth/register" title="Register" />
          </>
        )}
      </div>
    </nav>
  );
}
