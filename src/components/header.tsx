import { getSession } from "@/lib/auth";
import Link from "next/link";

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
        <Link href="/about">
          <span className="text-primary">About</span>
        </Link>
        <Link href="/feedback">
          <span className="text-primary">Feedback</span>
        </Link>
        {session ? (
          <>
            <Link href="/groups">
              <span className="text-primary">Flashcards</span>
            </Link>
            <Link href="/plan">
              <span className="text-primary">Account</span>
            </Link>
          </>
        ) : (
          <>
            <Link href="/auth/login">
              <span className="text-primary">Login</span>
            </Link>
            <Link href="/auth/register">
              <span className="text-primary">Register</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
