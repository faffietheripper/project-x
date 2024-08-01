"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden h-screen bg-[url(https://cdn.pixabay.com/photo/2020/07/13/13/20/garbage-5400780_1280.jpg)] bg-cover bg-no-repeat">
      <Content />
      <GradientGrid />
    </section>
  );
}

const Content = () => {
  return (
    <div className="relative z-20 mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-24 md:px-8 md:py-72">
      <motion.div
        initial={{
          y: 25,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 1.25,
          ease: "easeInOut",
        }}
        className="relative"
      ></motion.div>
      <motion.h1
        initial={{
          y: 25,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 1.25,
          delay: 0.25,
          ease: "easeInOut",
        }}
        className="mb-3 text-center text-3xl font-bold leading-tight text-zinc-50 sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight"
      >
        Connecting Construction Companies with Sustainable Waste Management
        Solutions
      </motion.h1>
      <motion.p
        initial={{
          y: 25,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 1.25,
          delay: 0.5,
          ease: "easeInOut",
        }}
        className="mb-9 max-w-2xl text-center text-base leading-relaxed text-white sm:text-lg md:text-lg md:leading-relaxed"
      >
        Build beautiful landing pages for your startups, clients, and side
        projects, without having to think about design.
      </motion.p>
      <motion.div
        initial={{
          y: 25,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 1.0,
          delay: 0.25,
          ease: "easeInOut",
        }}
        className="flex flex-col items-center gap-6 sm:flex-row"
      >
        <button className="bg-indigo-600 text-white text-base md:text-lg font-medium px-8 py-2 shadow-[3px_3px_0_black] hover:shadow-[1px_1px_0_black] hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
          Try it free
        </button>
        <button className="bg-black text-white text-base md:text-lg font-medium px-8 py-2 shadow-[3px_3px_0_indigo] hover:shadow-[1px_1px_0_indigo] hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
          Learn More
        </button>
      </motion.div>
    </div>
  );
};

const GradientGrid = () => {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 2.5,
        ease: "easeInOut",
      }}
      className="absolute inset-0 z-0"
    >
      <div className="absolute inset-0 z-0" />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-zinc-950/0 to-zinc-950" />
    </motion.div>
  );
};

const GRID_BOX_SIZE = 32;
const BEAM_WIDTH_OFFSET = 1;
