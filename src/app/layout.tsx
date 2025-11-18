import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Providers } from "./providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Lawlaw Delights - Authentic Filipino Seafood & Cooking Guides",
  description: "Discover the finest Lawlaw delicacies from Bulan, Sorsogon. Shop fresh seafood and learn traditional Filipino cooking with our interactive DIY guides.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased bg-gradient-to-br from-cream-50 to-green-50 min-h-screen`}
      >
        <Providers>
          {!session && <Header />}
          <main className="min-h-screen">
            {children}
          </main>
          {!session && <Footer />}
        </Providers>
      </body>
    </html>
  );
}
