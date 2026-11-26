import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  style: "normal",
});

export const metadata: Metadata = {
  title: "readcode — Your AI coding workspace",
  description: "Explore projects, understand code, and make your next move with an AI coding partner.",
  applicationName: "readcode",
  openGraph: {
    title: "readcode — Your AI coding workspace",
    description: "Explore projects, understand code, and make your next move with an AI coding partner.",
    siteName: "readcode",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full antialiased ${geist.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
