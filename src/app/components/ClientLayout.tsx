'use client';

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import IdleTimeoutHandler from "./IdleTimeoutHandler";
import { Session } from "next-auth";

interface ClientLayoutProps {
  children: React.ReactNode;
  session: Session | null;
}

export default function ClientLayout({ children, session }: ClientLayoutProps) {
  const pathname = usePathname();

  // Hide header for admin pages
  const isAdminPage = pathname?.startsWith('/admin');

  // Hide footer for logged-in users and admin pages
  const showFooter = !session && !isAdminPage;

  return (
    <>
      {/* Idle Timeout Handler - Shows warning before auto-logout */}
      <IdleTimeoutHandler timeoutMinutes={30} warningMinutes={2} />

      {!isAdminPage && <Header />}
      <main className={`min-h-screen ${!isAdminPage ? 'pt-16 sm:pt-20 pb-16 md:pb-0' : ''}`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </>
  );
}
