"use client";

import React from "react";

export default function ActivityFeed() {
  return (
    <div className="flex flex-wrap sm:flex-no-wrap items-center justify-between pl-[24vw] p-10 h-[100vh] w-full">
      <div className="w-full sm:w-1/3 h-[90vh]  rounded-t sm:rounded-l sm:rounded-t-none shadow-lg" />
      <div className="w-full sm:w-1/3 h-[90vh] shadow-lg" />
      <div className="w-full sm:w-1/3 h-[90vh] rounded-b sm:rounded-b-none shadow-lg" />
    </div>
  );
}
