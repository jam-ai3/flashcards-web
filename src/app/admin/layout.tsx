import { Metadata } from "next";
import AdminHeader from "./_components/admin-header";

export const metadata: Metadata = {
  robots: "noindex, nofollow",
  title: "Admin",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-col h-screen">
      <AdminHeader />
      <div className="p-4 h-full">{children}</div>
    </main>
  );
}
