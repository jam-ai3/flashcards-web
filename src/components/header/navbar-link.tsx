"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavbarLinkProps = {
  href: string;
  title: string;
};

export default function NavbarLink({ href, title }: NavbarLinkProps) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link href={href}>
      <span
        className={`${
          active ? "font-semibold text-primary" : "text-muted-foreground"
        } text-sm`}
      >
        {title}
      </span>
    </Link>
  );
}
