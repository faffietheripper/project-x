import Header from "@/components/app/Header";
import ActivityFeed from "@/components/app/ActivityFeed";
import React from "react";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/toaster";
import { redirect } from "next/navigation"; // ✅ Import redirect
import Header2 from "@/components/app/Header2";

export default async function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  // ✅ Redirect to login page if user is not authenticated
  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div>
      <Header />
      <Toaster />
      <Header2 />
      <div>{children}</div>
    </div>
  );
}
