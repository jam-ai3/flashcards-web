import Footer from "@/components/footer";
import Header from "@/components/header";
import { ContactForm } from "./_components/contact-form";

export default function FeedbackPage() {
  return (
    <>
      <main className="flex flex-col gap-6 p-8 h-screen">
        <Header />
        <div className="grid grid-cols-[1fr_4fr_1fr] items-center h-full">
          <div />
          <ContactForm
            title="Contact Us"
            description="Let us know what features you'd like to see next or what we can improve on"
          />
        </div>
        <div />
      </main>
      <Footer absolute />
    </>
  );
}
