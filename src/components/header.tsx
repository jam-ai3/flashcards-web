import { getSession } from "@/lib/auth";
import Link from "next/link";
import NavbarLink from "./navbar-link";
import {
  ACCOUNT_PAGE_URL,
  LOGIN_PAGE_URL,
  REGISTER_PAGE_URL,
} from "@/lib/constants";
import Image from "next/image";

const LOGO_SIZE = 64;

export default async function Header() {
  const session = await getSession();

  return (
    <nav className="flex justify-between">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/logo-no-bg.png"
          alt="logo"
          width={LOGO_SIZE}
          height={LOGO_SIZE}
        />
        <h1 className="font-semibold text-2xl text-primary">
          Flashcards Generator
        </h1>
      </Link>
      <div className="flex gap-8">
        {session ? (
          <>
            <NavbarLink href="/groups" title="Flashcards" />
            <NavbarLink href={ACCOUNT_PAGE_URL} title="Account" />
          </>
        ) : (
          <>
            <NavbarLink href={LOGIN_PAGE_URL} title="Login" />
            <NavbarLink href={REGISTER_PAGE_URL} title="Register" />
          </>
        )}
      </div>
    </nav>
  );
}
