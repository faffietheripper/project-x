"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="bg-blue-600 text-white py-2 px-4 h-fit w-fit rounded-md"
    >
      Sign Out
    </button>
  );
}
