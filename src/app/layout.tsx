import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";
import { getServerSession } from "next-auth";
import { authOptions } from "../app/lib/auth";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "arial", "sans-serif"],
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
          <ClientLayout session={session}>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
