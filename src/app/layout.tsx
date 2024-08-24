import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SessionProvider } from "next-auth/react";
import { AppKnockProviders } from "@/app/knock-provider";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Bidding App",
  description: "Trying out shit lol",
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
          <AppKnockProviders>
            <div className="">{children}</div>
          </AppKnockProviders>
        </SessionProvider>
      </body>
    </html>
  );
}
