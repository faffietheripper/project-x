"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import {
  getUnreadNotificationsCount,
  checkForSystemNotifications,
} from "@/app/home/notifications/actions";

export default function Header() {
  const { data: session, status } = useSession();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [hasSystemNotifications, setHasSystemNotifications] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (session?.user?.id) {
        const count = await getUnreadNotificationsCount(session.user.id);
        setUnreadCount(count);

        const hasSystemNotifs = await checkForSystemNotifications(
          session.user.id
        );
        setHasSystemNotifications(hasSystemNotifs);
      }
    };

    fetchNotifications();
  }, [session]);

  const showNotificationIndicator = unreadCount > 0 || hasSystemNotifications;

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-black text-white shadow-md p-12 fixed w-[20vw] flex z-50 h-full">
      <div className="flex flex-col justify-between">
        <div className="flex flex-col justify-between gap-8">
          <Link
            href="/home"
            className="text-3xl font-bold flex items-center gap-4 mb-8"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="white"
              class="size-10"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
              />
            </svg>
            Waste X
          </Link>
          <Link href="/home" className="text-md font-semibold">
            Home Page.
          </Link>
          <Link href="/home/waste-listings" className="text-md font-semibold">
            Waste Listings.
          </Link>
          {session?.user?.role === "administrator" && (
            <Link href="/home/items/create" className="text-md font-semibold">
              Create Waste Listing.
            </Link>
          )}
          <Link href="/home/my-activity" className="text-md font-semibold">
            My Activity.
          </Link>
          <Link href="/home/team-dashboard" className="text-md font-semibold">
            Team Dashboard
          </Link>
          <Link href="/home/notifications" className="text-md font-semibold">
            Notifications
          </Link>
          <Link href="/home/notifications" className="text-md font-semibold">
            The Carrier Hub
          </Link>
          <Link href="/home/notifications" className="text-md font-semibold">
            User Settings - to put billing
          </Link>
        </div>
      </div>
    </div>
  );
}
