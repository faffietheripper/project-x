"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  NotificationCell,
  NotificationFeedPopover,
  NotificationIconButton,
} from "@knocklabs/react";
import { useRef } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isVisible, setIsVisible] = useState(false);
  const notifButtonRef = useRef(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  const userId = session?.user?.id;

  useEffect(() => {
    console.log("Session status:", status);
    console.log("User ID:", userId);
  }, [status, userId]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white shadow-md py-10 px-8 fixed z-50 w-full">
      <div className=" flex justify-between items-center">
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
              href="/home/waste-listings"
              className=" text-md font-semibold flex items-center gap-1"
            >
              Waste Listings.
            </Link>
          </div>
          <div className="text-md font-semibold flex items-center gap-8">
            <Link
              href="/home/items/create"
              className=" flex items-center gap-1"
            >
              Create Waste Listing.
            </Link>
          </div>
          <div className="text-md font-semibold flex items-center gap-8">
            <Link href="/home/my-activity" className=" flex items-center gap-1">
              My Activity.
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {userId && (
            <>
              <NotificationIconButton
                ref={notifButtonRef}
                onClick={(e) => setIsVisible(!isVisible)}
              />
              <NotificationFeedPopover
                buttonRef={notifButtonRef}
                isVisible={isVisible}
                onClose={() => setIsVisible(false)}
                renderItem={({ item, ...props }) => (
                  <NotificationCell {...props} item={item}>
                    <div className="rounded-xl">
                      <Link
                        className="text-blue-400 hover:text=blue-500"
                        onClick={() => {
                          setIsVisible(false);
                        }}
                        href={`/home/items/${item?.data?.itemId}`}
                      >
                        Someone outbidded you on{" "}
                        <span className="font-bold">
                          {item?.data?.itemName}
                        </span>{" "}
                        by ${item?.data?.bidAmount}
                      </Link>
                    </div>
                  </NotificationCell>
                )}
              />
            </>
          )}
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
