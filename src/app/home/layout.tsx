import Header from "@/components/app/Header";
import AppFooter from "@/components/app/AppFooter";
import React from "react";
import { auth } from "@/auth";

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }
  return (
    <div>
      <Header />
      <div className="">{children}</div>
      <AppFooter />
    </div>
  );
}
