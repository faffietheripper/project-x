"use client";

import React, { useState, useRef, ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CarrierHubNav() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="pl-72 pt-[13vh] w-full fixed">
      <SlideTabs setShowModal={setShowModal} />
    </div>
  );
}

// ---------- SlideTabs ----------
interface SlideTabsProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const SlideTabs: React.FC<SlideTabsProps> = ({ setShowModal }) => {
  const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 });

  return (
    <ul
      onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
      className="relative flex justify-around bg-gray-200 h-[13vh] pt-4 text-sm px-10"
    >
      <Tab setPosition={setPosition}>
        <Link href="/home/carrier-hub">Analytics Dashboard</Link>
      </Tab>

      <Tab setPosition={setPosition}>
        <Link href="/home/my-activity/withdrawals">Assigned Jobs</Link>
      </Tab>

      <Tab setPosition={setPosition}>
        <Link href="/home/my-activity/reviews">Incident Reporting</Link>
      </Tab>

      <Cursor position={position} />
    </ul>
  );
};

// ---------- Tab ----------
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

// ---------- Cursor ----------
interface CursorProps {
  position: { left: number; width: number; opacity: number };
}

const Cursor: React.FC<CursorProps> = ({ position }) => (
  <motion.li
    animate={{ ...position }}
    className="absolute z-0 h-7 rounded-full bg-blue-600 md:h-12"
  />
);

// ---------- Option ----------
interface OptionProps {
  text: string;
  Icon: React.ComponentType;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onClick?: () => void;
}

const Option: React.FC<OptionProps> = ({ text, Icon, setOpen, onClick }) => (
  <motion.li
    variants={itemVariants}
    onClick={() => {
      setOpen(false);
      if (onClick) onClick();
    }}
    className="flex items-center gap-2 w-full p-2 text-xs font-medium whitespace-nowrap rounded-md hover:bg-indigo-100 text-slate-700 hover:text-indigo-500 transition-colors cursor-pointer"
  >
    <motion.span variants={actionIconVariants}>
      <Icon />
    </motion.span>
    <span>{text}</span>
  </motion.li>
);

// ---------- Animation Variants ----------
const wrapperVariants = {
  open: {
    scaleY: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.1 },
  },
  closed: {
    scaleY: 0,
    transition: { when: "afterChildren", staggerChildren: 0.1 },
  },
};

const iconVariants = {
  open: { rotate: 180 },
  closed: { rotate: 0 },
};

const itemVariants = {
  open: { opacity: 1, y: 0 },
  closed: { opacity: 0, y: -15 },
};

const actionIconVariants = {
  open: { scale: 1, y: 0 },
  closed: { scale: 0, y: -7 },
};
