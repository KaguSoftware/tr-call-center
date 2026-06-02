import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { t } from "@/lib/strings";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: t.appName,
  description: t.appName,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" dir="ltr" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
