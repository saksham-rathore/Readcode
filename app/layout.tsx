import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Readcode — Understand your code at every level",
  description:
    "A coding assistant that knows your entire codebase. Ask how it works, trace dependencies, and get answers grounded in your source code.",
  applicationName: "Readcode",
  openGraph: {
    title: "Readcode — Understand your code at every level",
    description:
      "A coding assistant that knows your entire codebase. Get answers grounded in your source code.",
    siteName: "Readcode",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
