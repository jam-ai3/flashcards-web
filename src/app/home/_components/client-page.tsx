"use client";

import { Button } from "@/components/ui/button";
import useWindowSize from "@/hooks/useWindowSize";
import { LG_WIDTH, LOGIN_PAGE_URL } from "@/lib/constants";
import { Session } from "@/lib/types";
import { ArrowRight, LogIn } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/footer";

type ClientPageProps = {
  session: Session | null;
};

export default function ClientPage({ session }: ClientPageProps) {
  const { width } = useWindowSize();
  const IMAGE_HEIGHT = width <= LG_WIDTH ? 300 : 400;
  const IMAGE_WIDTH = width <= LG_WIDTH ? 300 : 400;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 lg:gap-4 h-full px-4 lg:py-4 py-16">
        <section className="h-full grid place-items-center">
          <div className="flex flex-col gap-6">
            <p className="text-2xl lg:text-4xl font-bold text-center lg:text-left">
              Write Less, Study More
            </p>
            <p className="text-muted-foreground max-w-2/3 text-md lg:text-lg text-center lg:text-left mx-auto lg:mx-0">
              Generate flashcards from your notes, syllabus, or some information
              about your course. Then upload them to Anki or Quizlet to study.
            </p>
            <Button asChild className="w-fit mx-auto lg:mx-0">
              <Link href={session ? "/" : LOGIN_PAGE_URL}>
                <span className="text-background">
                  {session ? "Generate Flashcards" : "Login"}
                </span>
                {session ? (
                  <ArrowRight className="text-background" />
                ) : (
                  <LogIn className="text-background" />
                )}
              </Link>
            </Button>
          </div>
        </section>
        <section className={`h-full relative min-h-[300px]`}>
          <Image
            src={{
              src: "/quizlet.webp",
              width: IMAGE_WIDTH,
              height: IMAGE_HEIGHT,
            }}
            alt="Quizlet Home Page"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              translate: "-90% -70%",
              rotate: "-12deg",
            }}
          />
          <Image
            src={{
              src: "/anki.webp",
              width: IMAGE_WIDTH,
              height: IMAGE_HEIGHT,
            }}
            alt="Anki Home Page"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              translate: "-30% -40%",
              rotate: "12deg",
            }}
          />
        </section>
      </div>
      <Footer absolute={width > LG_WIDTH} />
    </>
  );
}
