"use client";

import { Session } from "@/lib/types";
import { MD_WIDTH } from "@/lib/constants";
import useWindowSize from "@/hooks/useWindowSize";
import MobileHeader from "./mobile-header";
import FullHeader from "./full-header";

export type HeaderProps = {
  session: Session | null;
};

export default function ClientHeader({ session }: HeaderProps) {
  const { width } = useWindowSize();

  if (width <= MD_WIDTH) return <MobileHeader session={session} />;
  return <FullHeader session={session} />;
}
