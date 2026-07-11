import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — AI Investment Research Agent`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "investment",
    "AI",
    "stock analysis",
    "financial research",
    "LangGraph",
    "Groq",
  ],
  authors: [{ name: "InvestIQ" }],
  openGraph: {
    title: `${APP_NAME} — AI Investment Research Agent`,
    description: APP_DESCRIPTION,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#030712",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
    >
      <body className="min-h-screen bg-[#030712] text-slate-100 antialiased font-[var(--font-geist-sans)]">
        {/* Ambient background gradients */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 overflow-hidden"
        >
          <div className="absolute -top-1/4 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-950/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-purple-950/20 blur-3xl" />
        </div>

        {/* Sticky top navigation */}
        <Navbar />

        {/* Page content */}
        <main className="relative flex-1">{children}</main>
      </body>
    </html>
  );
}
