"use client";

import React, { useState, useRef, ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CarrierHubNav({
  chainOfCustody,
}: {
  chainOfCustody: string | null;
}) {
  if (!chainOfCustody) return null;

  return (
    <div className="pl-72 pt-[13vh] fixed">
      {chainOfCustody === "wasteCarrier" && <CarrierTabs />}
      {chainOfCustody === "wasteManager" && <ManagerTabs />}
    </div>
  );
}

//
// ---------------------------------------------------------
// CARRIER NAVIGATION
// ---------------------------------------------------------
//

const CarrierTabs = () => {
  const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 });

  return (
    <ul
      onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
      className="relative flex justify-between w-[80vw] bg-gray-200 h-[13vh] pt-4 text-sm px-10"
    >
      <Tab setPosition={setPosition}>
        <Link href="/home/carrier-hub/waste-carriers/analytics">
          Analytics Dashboard
        </Link>
      </Tab>

      <Tab setPosition={setPosition}>
        <Link href="/home/carrier-hub/waste-carriers/assigned-carrier-jobs">
          Assigned Jobs
        </Link>
      </Tab>

      <Tab setPosition={setPosition}>
        <Link href="/home/carrier-hub/waste-carriers/incidents-&-reports">
          Incident & Reports
        </Link>
      </Tab>

      <Tab setPosition={setPosition}>
        <Link href="/home/carrier-hub/waste-carriers/reviews">Reviews</Link>
      </Tab>

      <Cursor position={position} />
    </ul>
  );
};

//
// ---------------------------------------------------------
// MANAGER NAVIGATION
// ---------------------------------------------------------
//

const ManagerTabs = () => {
  const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 });

  return (
    <ul
      onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
      className="relative flex justify-between w-[80vw] bg-gray-200 h-[13vh] pt-4 text-sm px-10"
    >
      <Tab setPosition={setPosition}>
        <Link href="/home/carrier-hub/carrier-manager/analytics">
          Analytics Dashboard
        </Link>
      </Tab>

      <Tab setPosition={setPosition}>
        <Link href="/home/carrier-hub/carrier-manager/job-assignments">
          Job Assignments
        </Link>
      </Tab>

      <Tab setPosition={setPosition}>
        <Link href="/home/carrier-hub/carrier-manager/reviews">
          Carrier Reviews
        </Link>
      </Tab>

      <Tab setPosition={setPosition}>
        <Link href="/home/carrier-hub/carrier-manager/incident-management">
          Incident Management
        </Link>
      </Tab>

      <Cursor position={position} />
    </ul>
  );
};

//
// ---------------------------------------------------------
// Shared Components
// ---------------------------------------------------------
//

interface TabProps {
  children: ReactNode;
  setPosition: React.Dispatch<
    React.SetStateAction<{ left: number; width: number; opacity: number }>
  >;
}

const Tab: React.FC<TabProps> = ({ children, setPosition }) => {
  const ref = useRef<HTMLLIElement>(null);

  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({
          left: ref.current.offsetLeft,
          width,
          opacity: 1,
        });
      }}
      className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs font-bold text-black hover:text-white md:px-8 md:py-3 md:text-base"
    >
      {children}
    </li>
  );
};

const Cursor = ({
  position,
}: {
  position: { left: number; width: number; opacity: number };
}) => (
  <motion.li
    animate={{ ...position }}
    className="absolute z-0 h-7 rounded-full bg-blue-600 md:h-12"
  />
);
