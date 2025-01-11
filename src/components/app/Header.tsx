"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isVisible, setIsVisible] = useState(false);
  const notifButtonRef = useRef<HTMLButtonElement>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  const userId = session?.user?.id;
  const userRole = session?.user?.role; // Assuming role is part of the session data

  //need to put skeleton here bro!!
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white shadow-md py-10 px-8 fixed z-50 w-full">
      <div className=" flex justify-between items-center">
        <div className="flex items-center gap-8">
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
              href="/home/waste-listings"
              className=" text-md font-semibold flex items-center gap-1"
            >
              Waste Listings.
            </Link>
          </div>
          {userRole === "wasteGenerator" && (
            <div className="text-md font-semibold flex items-center gap-8">
              <Link
                href="/home/items/create"
                className=" flex items-center gap-1"
              >
                Create Waste Listing.
              </Link>
            </div>
          )}

          <div className="text-md font-semibold flex items-center gap-8">
            <Link href="/home/my-activity" className=" flex items-center gap-1">
              My Activity.
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-md font-semibold flex items-center gap-8">
            <Link
              href="/home/notifications"
              className=" flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
            </Link>
            <Link href="/home/the-hub" className=" flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"
                />
              </svg>
            </Link>
          </div>

          <Link href="/home/me" className="flex space-x-3 items-center">
            {session?.user.image ? (
              <Image
                src={session.user.image}
                width="40"
                height="40"
                alt="user avatar"
                className="rounded-full"
              />
            ) : (
              <Image
                src="/avatar.png"
                width="40"
                height="40"
                alt="user avatar"
                className="rounded-full"
              />
            )}
            <div>{session?.user.name}</div>
          </Link>
          <div>
            <button
              className="bg-blue-600 text-white py-2 px-4 rounded-md"
              onClick={() =>
                signOut({
                  callbackUrl: "/",
                })
              }
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
