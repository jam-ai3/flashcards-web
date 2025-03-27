"use client";

import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type ErrorProps = {
  reset: () => void;
};

export default function Error({ reset }: ErrorProps) {
  return (
    <>
      <main className="flex flex-col gap-6 p-8 h-screen">
        <div className="grid place-items-center h-full">
          <div className="flex flex-col gap-4 items-center">
            <p className="text-muted-foreground mb-[-16px]">
              No Flashcards Here
            </p>
            <h1 className="font-semibold text-2xl">
              500 Internal Server Error
            </h1>
            <Button onClick={reset}>
              <span>Get Back To Generating</span>
              <ArrowRight />
            </Button>
          </div>
        </div>
      </main>
      <Footer absolute />
    </>
  );
}
