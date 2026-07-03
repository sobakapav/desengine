import type { Metadata } from "next";
import localFont from "next/font/local";
import { Navigation } from "@/components/desengine/system/Navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
import "./base.css";

const inter = localFont({
  src: [
    {
      path: "./fonts/InterVariable.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "./fonts/InterVariable-Italic.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-ui",
  fallback: ["Segoe UI", "Helvetica Neue", "Arial", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "desengine",
  description: "Инструмент для проектной работы над React-дизайном прямо в коде через workflow и шаги.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={inter.variable} suppressHydrationWarning>
      <body className="desengine-shell bg-background text-foreground">
        <TooltipProvider>
          <div className="min-h-screen">
            <Navigation />
            {children}
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
