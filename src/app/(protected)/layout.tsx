import Header from "@/components/header/header";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  robots: "noindex, nofollow",
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-col gap-6 p-8 h-screen">
      <Header />
      {children}
    </main>
  );
}
