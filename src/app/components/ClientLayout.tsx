'use client';

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import { Session } from "next-auth";

interface ClientLayoutProps {
  children: React.ReactNode;
  session: Session | null;
}

export default function ClientLayout({ children, session }: ClientLayoutProps) {
  const pathname = usePathname();

  // Hide header for admin pages
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdminPage && <Header />}
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
