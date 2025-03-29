import Footer from "@/components/footer";
import Header from "@/components/header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about us",
};

export default function AboutPage() {
  return (
    <>
      <main className="flex flex-col gap-6 p-8 h-screen">
        <Header />
        <h1 className="font-semibold text-2xl">About Us</h1>
        <section>
          <h2 className="font-semibold text-xl">Lorem ipsum dolor sit amet.</h2>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos,
            eveniet eaque quaerat molestias veniam dolores dolorem culpa
            architecto ipsam rem?
          </p>
        </section>
      </main>
      <Footer absolute />
    </>
  );
}
