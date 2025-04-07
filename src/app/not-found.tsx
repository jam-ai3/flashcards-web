import Footer from "@/components/footer";
import Header from "@/components/header/header";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <main className="flex flex-col gap-6 p-8 h-screen">
        <Header />
        <div className="grid place-items-center h-full">
          <div className="flex flex-col gap-4 items-center">
            <p className="text-muted-foreground mb-[-16px]">
              No Flashcards Here
            </p>
            <h1 className="font-semibold text-2xl">404 Not Found</h1>
            <Button asChild>
              <Link href="/">
                <span className="text-background">Get Back To Generating</span>
                <ArrowRight className="text-background" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer absolute />
    </>
  );
}
