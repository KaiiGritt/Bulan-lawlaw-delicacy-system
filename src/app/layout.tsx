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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })()
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} antialiased min-h-screen transition-colors duration-300`}
      >
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-cream-50 to-green-50 dark:animated-bg" />

        {/* Animated orbs for dark mode */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="dark:floating-orb absolute top-20 left-10 w-64 h-64 bg-green-500/10 dark:bg-green-500/20 rounded-full blur-3xl" />
          <div className="dark:floating-orb absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl" style={{ animationDelay: '5s' }} />
          <div className="dark:pulsing-orb absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl" />

          {/* Twinkling stars for dark mode */}
          <div className="hidden dark:block">
            <div className="twinkling-star absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full" />
            <div className="twinkling-star absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white rounded-full" style={{ animationDelay: '1s' }} />
            <div className="twinkling-star absolute bottom-1/4 left-1/3 w-2 h-2 bg-white rounded-full" style={{ animationDelay: '2s' }} />
            <div className="twinkling-star absolute top-2/3 right-1/4 w-1 h-1 bg-white rounded-full" style={{ animationDelay: '1.5s' }} />
            <div className="twinkling-star absolute bottom-1/3 right-1/2 w-1.5 h-1.5 bg-white rounded-full" style={{ animationDelay: '0.5s' }} />
          </div>
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
