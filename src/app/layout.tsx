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
  icons: {
    icon: '/lawlaw-delights-high-resolution-logo-transparent.png',
    apple: '/lawlaw-delights-high-resolution-logo-transparent.png',
    shortcut: '/lawlaw-delights-high-resolution-logo-transparent.png',
  },
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
        {/* Lawlaw Fish Gradient Background */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-lawlaw-silver via-lawlaw-silver-shimmer to-lawlaw-steel-blue/20" />

        {/* Animated orbs - Lawlaw ocean theme */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="floating-orb absolute top-20 left-10 w-64 h-64 bg-lawlaw-aqua-teal/10 rounded-full blur-3xl" />
          <div className="floating-orb absolute bottom-20 right-10 w-96 h-96 bg-lawlaw-steel-blue/10 rounded-full blur-3xl" style={{ animationDelay: '5s' }} />
          <div className="pulsing-orb absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-lawlaw-ocean-teal/5 rounded-full blur-3xl" />
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
