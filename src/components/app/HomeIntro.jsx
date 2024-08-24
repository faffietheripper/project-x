"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative mx-12 rounded-lg overflow-hidden h-[85vh] bg-[url(https://cdn.pixabay.com/photo/2020/07/13/13/20/garbage-5400780_1280.jpg)] bg-cover bg-no-repeat">
      <Content />
      <GradientGrid />
    </section>
  );
}

const Content = () => {
  return (
    <div className="relative grid grid-cols-3 gap-14 z-20 mx-auto items-center justify-center px-4 pt-64 md:px-8">
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
        className="mb-3 text-center col-span-2 w-[600px] text-3xl font-bold leading-tight text-zinc-50 sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight lg:text-5xl lg:leading-tight"
      >
        Connecting Construction Companies with Sustainable Waste Management
        Solutions
      </motion.h1>
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
