import React from "react";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { SignIn } from "@/components/sign-in";
import { SignOut } from "@/components/sign-out";

export default async function Header() {
  const session = await auth();

  return (
    <div className="bg-gray-200 py-2">
      <div className="container flex justify-between items-center">
        <div className="flex items-center gap-12">
          <Link href="/" className=" flex items-center gap-1">
            <Image
              src="/logo.png"
              width="100"
              height="100"
              alt="Logo"
              className="h-14 w-14"
            />
            Project X
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/" className="hover:underline flex items-center gap-1">
              Home Page
            </Link>
          </div>
          <div className="flex items-center gap-8">
            <Link
              href="/buyers"
              className="hover:underline flex items-center gap-1"
            >
              Jobs on Display (All Auctions)
            </Link>
          </div>
          <div className="flex items-center gap-8">
            <Link
              href="/items/create"
              className="hover:underline flex items-center gap-1"
            >
              Sellers
            </Link>
          </div>
          <div className="flex items-center gap-8">
            <Link
              href="/auctions"
              className="hover:underline flex items-center gap-1"
            >
              My Auctions
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div> {session?.user?.name}</div>
          <div> {session ? <SignOut /> : <SignIn />}</div>
        </div>
      </div>
    </div>
  );
}
