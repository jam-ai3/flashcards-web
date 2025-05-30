"use client";

import Link from "next/link";
import { HeaderProps } from "./client-header";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Grid } from "lucide-react";
import { ACCOUNT_PAGE_URL } from "@/lib/constants";

const LOGO_SIZE = 64;

export default function MobileHeader({ session }: HeaderProps) {
  return (
    <nav className="flex justify-between items-center">
      <Link href="/" className="flex items-center gap-2">
        <Image
          src="/logo-no-bg.png"
          alt="logo"
          width={LOGO_SIZE}
          height={LOGO_SIZE}
        />
        <span className="font-semibold text-xl">jamAI</span>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="accent">
            <Grid />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {session ? (
            <>
              <DropdownMenuItem asChild>
                <Link href="/flashcards">
                  <span>Flashcards</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={ACCOUNT_PAGE_URL}>
                  <span>Account</span>
                </Link>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <Link href="/login">
                  <span>Login</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/register">
                  <span>Register</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
