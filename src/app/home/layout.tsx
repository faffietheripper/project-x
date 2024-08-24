import Header from "@/components/app/Header";
import React from "react";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/toaster";

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
      <Toaster />
      <div className="">{children}</div>
    </div>
  );
}
