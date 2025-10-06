import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import CarrierHubNav from "@/components/app/CarrierHub/CarrierHubNav";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn("font-sans antialiased", fontSans.variable)}>
      <CarrierHubNav />
      <main className="">{children}</main>
    </div>
  );
}
