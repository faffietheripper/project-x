"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ActivityNav({ userRole }) {
  return (
    <div className="pl-72 pt-[13vh] fixed">
      <SlideTabs userRole={userRole} />
    </div>
  );
}

const SlideTabs = ({ userRole }) => {
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  return (
    <ul
      onMouseLeave={() => {
        setPosition((pv) => ({
          ...pv,
          opacity: 0,
        }));
      }}
      className="relative flex justify-between bg-gray-200 h-[13vh] pt-4 text-sm px-10"
    >
      <Tab setPosition={setPosition}>
        <Link href="/home/my-activity">My Profile</Link>
      </Tab>
      {userRole === "wasteManager" && (
        <Tab setPosition={setPosition}>
          <Link href="/home/my-activity/my-bids">View My Bids</Link>
        </Tab>
      )}
      {userRole === "wasteManager" && (
        <Tab setPosition={setPosition}>
          <Link href="/home/my-activity/assigned-jobs">Assigned Jobs</Link>
        </Tab>
      )}
      {userRole === "wasteGenerator" && (
        <Tab setPosition={setPosition}>
          <Link href="/home/my-activity/my-listings">Active Listings</Link>
        </Tab>
      )}
      {userRole === "wasteGenerator" && (
        <Tab setPosition={setPosition}>
          <Link href="/home/my-activity/archived-listings">
            Archived Listings
          </Link>
        </Tab>
      )}
      {userRole === "wasteGenerator" && (
        <Tab setPosition={setPosition}>
          <Link href="/home/my-activity/jobs-in-progress">
            Jobs in Progress
          </Link>
        </Tab>
      )}
      <Tab setPosition={setPosition}>
        <Link href="/home/my-activity/withdrawals">Withdrawals</Link>
      </Tab>
      <Tab setPosition={setPosition}>
        <Link href="/home/my-activity/completed-jobs">Jobs Completed</Link>
      </Tab>
      <Tab setPosition={setPosition}>
        <Link href="/home/my-activity/reviews">Reviews</Link>
      </Tab>
      <Cursor position={position} />
    </ul>
  );
};

const Tab = ({ children, setPosition }) => {
  const ref = useRef(null);

  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref?.current) return;

        const { width } = ref.current.getBoundingClientRect();

        setPosition({
          left: ref.current.offsetLeft,
          width,
          opacity: 1,
        });
      }}
      className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs font-bold text-black hover:text-white  md:px-8 md:py-3 md:text-base"
    >
      {children}
    </li>
  );
};

const Cursor = ({ position }) => {
  return (
    <motion.li
      animate={{
        ...position,
      }}
      className="absolute z-0 h-7 rounded-full bg-blue-600 md:h-12"
    />
  );
};
