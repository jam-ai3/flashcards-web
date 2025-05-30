"use client";

import Image from "next/image";
import Link from "next/link";
import NavbarLink from "./navbar-link";
import {
  ACCOUNT_PAGE_URL,
  LOGIN_PAGE_URL,
  REGISTER_PAGE_URL,
} from "@/lib/constants";
import { HeaderProps } from "./client-header";

const LOGO_SIZE = 64;

export default function FullHeader({ session }: HeaderProps) {
  return (
    <nav className="flex justify-between items-center">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/logo-no-bg.png"
          alt="logo"
          width={LOGO_SIZE}
          height={LOGO_SIZE}
        />
        <span className="font-semibold text-primary text-lg lg:text-2xl">
          jamAI
        </span>
      </Link>
      <div className="flex gap-8">
        {session ? (
          <>
            <NavbarLink href="/flashcards" title="Flashcards" />
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
