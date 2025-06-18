import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Teen Budget Tracker",
  description: "A modern budget tracking app for teenagers to learn financial literacy",
  keywords: ["budget", "tracker", "teenager", "finance", "money", "savings"],
  authors: [{ name: "Teen Budget Tracker" }],
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <QueryProvider>
            <DashboardLayoutClient>
              {children}
            </DashboardLayoutClient>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
