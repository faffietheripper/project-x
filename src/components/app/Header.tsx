import React from "react";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import SignIn from "../sign-in";
import SignOut from "../sign-out";

export default async function Header() {
  const session = await auth();

  return (
    <div className="bg-white shadow-md py-10 px-20 fixed z-50 w-full">
      <div className="container flex justify-between items-center">
        <div className="flex items-center gap-12">
          <Link
            href="/home"
            className=" text-3xl font-bold flex gap-x-4 items-center gap-1"
          >
            <Image
              src="/logo.png"
              width="100"
              height="100"
              alt="Logo"
              className="h-10 w-10"
            />
            Project X
          </Link>
          <div className="flex items-center gap-8">
            <Link
              href="/home"
              className=" flex text-md font-semibold items-center gap-1"
            >
              Home Page.
            </Link>
          </div>
          <div className="flex items-center gap-8">
            <Link
              href="/home/buyers"
              className=" text-md font-semibold flex items-center gap-1"
            >
              All Projects.
            </Link>
          </div>
          <div className="text-md font-semibold flex items-center gap-8">
            <Link
              href="/home/items/create"
              className=" flex items-center gap-1"
            >
              Add a Project.
            </Link>
          </div>
          <div className="text-md font-semibold flex items-center gap-8">
            <Link href="/home/auctions" className=" flex items-center gap-1">
              My Projects.
            </Link>
          </div>
          <div className="text-md font-semibold flex items-center gap-8">
            <Link href="/home/auctions" className=" flex items-center gap-1">
              My Bids.
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Image
            className="rounded-full ml-8 h-10 w-10 object-cover"
            src={session?.user?.image}
            alt="Profile picture"
            height={900}
            width={900}
          />

          <div> {session?.user?.name}</div>
          <div> {session ? <SignOut /> : <SignIn />}</div>
        </div>
      </div>
    </div>
  );
}
