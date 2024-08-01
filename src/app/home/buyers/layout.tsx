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
      <div className="">{children}</div>
    </div>
  );
}
