"use client";

import React, { useState } from "react";
import useMeasure from "react-use-measure";
import {
  useDragControls,
  useMotionValue,
  useAnimate,
  motion,
} from "framer-motion";
import { cancelJobAction } from "@/app/home/my-activity/assigned-jobs/actions";

export default function CancelJob({ itemId, bidId }) {
  const [open, setOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const handleCancelJob = async (e) => {
    e.preventDefault();
    if (cancellationReason.trim()) {
      const result = await cancelJobAction({
        itemId,
        bidId,
        cancellationReason,
      });
      if (result.success) {
        alert(result.message);
        setOpen(false);
      } else {
        alert(result.message);
      }
    } else {
      alert("Please provide a cancellation reason.");
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-500"
      >
        Cancel Job
      </button>

      <DragCloseDrawer open={open} setOpen={setOpen}>
        <div className=" mx-auto text-center space-y-4 text-neutral-400">
          <h2 className="text-4xl mx-auto text-center font-bold text-neutral-200 mb-16">
            Please provide a reason why you would like to cancel this job
          </h2>
          <form onSubmit={handleCancelJob} className="flex flex-col">
            <textarea
              name="cancellationReason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="w-[900px] rounded-md border-0 p-3 h-72 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder-black focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
              placeholder="Cancellation Reason"
              required
            ></textarea>
            <button
              type="submit"
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-500 w-56"
            >
              Confirm Cancellation
            </button>
          </form>
        </div>
      </DragCloseDrawer>
    </div>
  );
}

const DragCloseDrawer = ({ open, setOpen, children }) => {
  const [scope, animate] = useAnimate();
  const [drawerRef, { height }] = useMeasure();

  const y = useMotionValue(0);
  const controls = useDragControls();

  const handleClose = async () => {
    animate(scope.current, { opacity: [1, 0] });
    const yStart = typeof y.get() === "number" ? y.get() : 0;
    await animate("#drawer", { y: [yStart, height] });
    setOpen(false);
  };

  return (
    <>
      {open && (
        <motion.div
          ref={scope}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 bg-neutral-950/70"
        >
          <motion.div
            id="drawer"
            ref={drawerRef}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{ ease: "easeInOut" }}
            className="absolute bottom-0 h-[75vh] w-full overflow-hidden rounded-t-3xl bg-neutral-900"
            style={{ y }}
            drag="y"
            dragControls={controls}
            onDragEnd={() => {
              if (y.get() >= 100) {
                handleClose();
              }
            }}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
          >
            <div className="absolute left-0 right-0 top-0 z-10 flex justify-center bg-neutral-900 p-4">
              <button
                onPointerDown={(e) => {
                  controls.start(e);
                }}
                className="h-2 w-14 cursor-grab touch-none rounded-full bg-neutral-700 active:cursor-grabbing"
              ></button>
            </div>
            <div className="relative z-0 h-full overflow-y-scroll p-4 pt-12">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};
