"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiEdit, FiChevronDown, FiShare, FiPlusSquare } from "react-icons/fi";
import NewMemberModal from "./TeamDashboard/NewMemberModal";

export default function TeamNav({ userRole }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="pl-72 pt-[13vh] fixed">
      <SlideTabs userRole={userRole} setShowModal={setShowModal} />
      <NewMemberModal isOpen={showModal} setIsOpen={setShowModal} />
    </div>
  );
}

const SlideTabs = ({ userRole, setShowModal }) => {
  const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 });

  return (
    <ul
      onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
      className="relative flex justify-between w-[80vw] bg-gray-200 h-[13vh] pt-4 text-sm px-10"
    >
      <Tab setPosition={setPosition}>
        <Link href="/home/team-dashboard">Home</Link>
      </Tab>

      <Tab setPosition={setPosition}>
        <Link href="/home/team-dashboard/template-library">
          Template Library
        </Link>
      </Tab>

      {userRole === "wasteManager" && (
        <Tab setPosition={setPosition}>
          <Link href="/home/my-activity/assigned-jobs">Assigned Jobs</Link>
        </Tab>
      )}

      {userRole === "wasteGenerator" && (
        <>
          <Tab setPosition={setPosition}>
            <Link href="/home/my-activity/my-listings">Active Listings</Link>
          </Tab>
          <Tab setPosition={setPosition}>
            <Link href="/home/my-activity/archived-listings">
              Archived Listings
            </Link>
          </Tab>
          <Tab setPosition={setPosition}>
            <Link href="/home/my-activity/jobs-in-progress">
              Jobs in Progress
            </Link>
          </Tab>
        </>
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

      <Tab setPosition={setPosition}>
        <SettingsDropdown setShowModal={setShowModal} />
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
      className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs font-bold text-black hover:text-white md:px-8 md:py-3 md:text-base"
    >
      {children}
    </li>
  );
};

const Cursor = ({ position }) => {
  return (
    <motion.li
      animate={{ ...position }}
      className="absolute z-0 h-7 rounded-full bg-blue-600 md:h-12"
    />
  );
};

// ⚙ Settings Dropdown
const SettingsDropdown = ({ setShowModal }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div animate={open ? "open" : "closed"} className="relative">
      <button
        onClick={() => setOpen((pv) => !pv)}
        className="flex items-center gap-2 rounded-md text-black transition-colors"
      >
        <span>Settings</span>
        <motion.span variants={iconVariants}>
          <FiChevronDown />
        </motion.span>
      </button>

      <motion.ul
        initial={wrapperVariants.closed}
        variants={wrapperVariants}
        style={{ originY: "top", translateX: "-50%" }}
        className="flex flex-col gap-2 p-2 rounded-lg bg-white shadow-xl absolute top-[120%] left-[50%] w-48 overflow-hidden"
      >
        <Link href="/home/team-dashboard/team-profile">
          <Option setOpen={setOpen} Icon={FiEdit} text="Team Profile" />
        </Link>

        <Link href="/home/team-dashboard/new-template">
          <Option
            setOpen={setOpen}
            Icon={FiPlusSquare}
            text="Create New Template"
          />
        </Link>

        <Option setOpen={setOpen} Icon={FiShare} text="Manage Team" />

        <Option
          setOpen={setOpen}
          Icon={FiPlusSquare}
          text="Add New Member"
          onClick={() => setShowModal(true)}
        />
      </motion.ul>
    </motion.div>
  );
};

const Option = ({ text, Icon, setOpen, onClick }) => {
  return (
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
};

// Animation Variants
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
