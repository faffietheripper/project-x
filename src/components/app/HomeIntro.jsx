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
    <div className="relative grid grid-cols-2 gap-14 z-20 mx-auto items-center justify-center px-4 pt-64 md:px-8">
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
          delay: 0.5,
          ease: "easeInOut",
        }}
        className="mb-9 max-w-2xl text-center text-base leading-relaxed text-white sm:text-lg md:text-lg md:leading-relaxed"
      >
        <div class="relative">
          <label for="Search" class="sr-only">
            {" "}
            Search{" "}
          </label>

          <input
            type="text"
            id="Search"
            placeholder="Search for jobs by location"
            class="w-full rounded-md border-gray-200 p-6 pe-10 shadow-sm sm:text-sm"
          />

          <span class="absolute inset-y-0 end-0 grid w-10 place-content-center">
            <button type="button" class="text-gray-600 hover:text-gray-700">
              <span class="sr-only">Search</span>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-6 w-6 mr-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </button>
          </span>
        </div>
      </motion.div>
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
        className="mb-3 text-center text-3xl font-bold leading-tight text-zinc-50 sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight lg:text-5xl lg:leading-tight"
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
