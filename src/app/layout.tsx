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
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body
        className={`${inter.variable} antialiased min-h-screen transition-colors duration-300`}
      >
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-cream-50 to-green-50" />

        {/* Animated orbs */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" style={{ animationDelay: '5s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        <Providers>
          <ClientLayout session={session}>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
