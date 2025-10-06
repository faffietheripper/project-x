import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SessionProvider } from "next-auth/react";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Waste X",
  description:
    "Digital Waste Tracking System designed by Tino ad Jethro. This is the beta version. More to come.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("  font-sans antialiased", fontSans.variable)}>
        <SessionProvider>
          <div className="">{children}</div>
        </SessionProvider>
      </body>
    </html>
  );
}
