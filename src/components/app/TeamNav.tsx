"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiEdit, FiChevronDown, FiShare, FiPlusSquare } from "react-icons/fi";
import NewMemberModal from "./TeamDashboard/NewMemberModal";

/* =========================================================
   TYPES
========================================================= */

type ChainOfCustodyType =
  | "wasteManager"
  | "wasteGenerator"
  | "wasteCarrier"
  | null;

export default function TeamNav({
  chainOfCustody,
  userRole,
}: {
  chainOfCustody: ChainOfCustodyType;
  userRole: string | null;
}) {
  const [showModal, setShowModal] = useState(false);

  // If no chain provided, render nothing (prevents breaking layout)
  if (!chainOfCustody) {
    return null;
  }

  return (
    <div className="pl-72 pt-[13vh] fixed w-full">
      <SlideTabs
        chainOfCustody={chainOfCustody}
        userRole={userRole}
        setShowModal={setShowModal}
      />
      <NewMemberModal isOpen={showModal} setIsOpen={setShowModal} />
    </div>
  );
}

/* =========================================================
   SLIDE TABS
========================================================= */

const SlideTabs = ({
  chainOfCustody,
  userRole,
  setShowModal,
}: {
  chainOfCustody: ChainOfCustodyType;
  userRole: string | null;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

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

      <Tab setPosition={setPosition}>
        <ListingsDropdown
          chainOfCustody={chainOfCustody}
          setShowModal={setShowModal}
        />
      </Tab>

      {/* ================= WASTE MANAGER ================= */}
      {chainOfCustody === "wasteManager" && (
        <>
          <Tab setPosition={setPosition}>
            <Link href="/home/team-dashboard/team-withdrawals">
              Withdrawals
            </Link>
          </Tab>

          <Tab setPosition={setPosition}>
            <Link href="/home/team-dashboard/team-reviews">Reviews</Link>
          </Tab>
        </>
      )}

      {/* ================= WASTE GENERATOR ================= */}
      {chainOfCustody === "wasteGenerator" && (
        <Tab setPosition={setPosition}>
          <Link href="/home/team-dashboard/team-reviews">Reviews</Link>
        </Tab>
      )}

      {/* ================= WASTE CARRIER ================= */}
      {chainOfCustody === "wasteCarrier" && (
        <Tab setPosition={setPosition}>
          <Link href="/home/team-dashboard/carrier-jobs">My Jobs</Link>
        </Tab>
      )}

      {/* ================= ADMIN SETTINGS ================= */}
      {userRole === "administrator" && (
        <Tab setPosition={setPosition}>
          <SettingsDropdown setShowModal={setShowModal} />
        </Tab>
      )}

      <Cursor position={position} />
    </ul>
  );
};

/* =========================================================
   TAB
========================================================= */

const Tab = ({
  children,
  setPosition,
}: {
  children: React.ReactNode;
  setPosition: React.Dispatch<
    React.SetStateAction<{
      left: number;
      width: number;
      opacity: number;
    }>
  >;
}) => {
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

/* =========================================================
   CURSOR
========================================================= */

const Cursor = ({
  position,
}: {
  position: {
    left: number;
    width: number;
    opacity: number;
  };
}) => {
  return (
    <motion.li
      animate={{ ...position }}
      className="absolute z-0 h-7 rounded-full bg-blue-600 md:h-12"
    />
  );
};

/* =========================================================
   SETTINGS DROPDOWN
========================================================= */

const SettingsDropdown = ({
  setShowModal,
}: {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div animate={open ? "open" : "closed"} className="relative">
      <button
        onClick={() => setOpen((pv) => !pv)}
        className="flex items-center gap-2 text-black"
      >
        <span>Settings</span>
        <motion.span variants={iconVariants}>
          <FiChevronDown />
        </motion.span>
      </button>

      <motion.ul
        initial="closed"
        variants={wrapperVariants}
        style={{
          originY: "top",
          translateX: "-50%",
        }}
        className="flex flex-col gap-2 p-2 rounded-lg bg-white shadow-xl absolute top-[120%] left-[50%] w-48 overflow-hidden"
      >
        <Link href="/home/team-dashboard/team-profile">
          <Option setOpen={setOpen} Icon={FiEdit} text="Team Profile" />
        </Link>

        <Link href="/home/team-dashboard/new-template">
          <Option
            setOpen={setOpen}
            Icon={FiPlusSquare}
            text="Create Template"
          />
        </Link>
      </motion.ul>
    </motion.div>
  );
};

/* =========================================================
   LISTINGS DROPDOWN
========================================================= */

const ListingsDropdown = ({
  chainOfCustody,
  setShowModal,
}: {
  chainOfCustody: ChainOfCustodyType;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div animate={open ? "open" : "closed"} className="relative">
      <button
        onClick={() => setOpen((pv) => !pv)}
        className="flex items-center gap-2 text-black"
      >
        <span>Listings Management</span>
        <motion.span variants={iconVariants}>
          <FiChevronDown />
        </motion.span>
      </button>

      <motion.ul
        initial="closed"
        variants={wrapperVariants}
        style={{
          originY: "top",
          translateX: "-50%",
        }}
        className="flex flex-col gap-2 p-2 rounded-lg bg-white shadow-xl absolute top-[120%] left-[50%] w-48 overflow-hidden"
      >
        {chainOfCustody === "wasteManager" && (
          <>
            <Link href="/home/team-dashboard/team-assigned-jobs">
              <Option setOpen={setOpen} Icon={FiEdit} text="Assigned Jobs" />
            </Link>

            <Link href="/home/team-dashboard/team-bids">
              <Option setOpen={setOpen} Icon={FiShare} text="Team Bids" />
            </Link>
          </>
        )}

        {chainOfCustody === "wasteGenerator" && (
          <>
            <Link href="/home/team-dashboard/team-listings">
              <Option setOpen={setOpen} Icon={FiEdit} text="Active Listings" />
            </Link>

            <Link href="/home/team-dashboard/team-archived-listings">
              <Option
                setOpen={setOpen}
                Icon={FiEdit}
                text="Archived Listings"
              />
            </Link>
          </>
        )}
      </motion.ul>
    </motion.div>
  );
};

/* =========================================================
   OPTION
========================================================= */

const Option = ({
  text,
  Icon,
  setOpen,
}: {
  text: string;
  Icon: React.ComponentType;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <motion.li
      variants={itemVariants}
      onClick={() => setOpen(false)}
      className="flex items-center gap-2 w-full p-2 text-xs font-medium rounded-md hover:bg-indigo-100 text-slate-700 hover:text-indigo-500 cursor-pointer"
    >
      <motion.span variants={actionIconVariants}>
        <Icon />
      </motion.span>
      <span>{text}</span>
    </motion.li>
  );
};

/* =========================================================
   ANIMATION VARIANTS
========================================================= */

const wrapperVariants = {
  open: {
    scaleY: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.05 },
  },
  closed: {
    scaleY: 0,
    transition: { when: "afterChildren", staggerChildren: 0.05 },
  },
};

const iconVariants = {
  open: { rotate: 180 },
  closed: { rotate: 0 },
};

const itemVariants = {
  open: { opacity: 1, y: 0 },
  closed: { opacity: 0, y: -10 },
};

const actionIconVariants = {
  open: { scale: 1 },
  closed: { scale: 0.8 },
};
