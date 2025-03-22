import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";

export default async function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div>
      <AdminHeader />
      <div>{children}</div>
    </div>
  );
}
