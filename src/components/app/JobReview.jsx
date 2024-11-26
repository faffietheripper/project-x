"use client";

import React, { useState } from "react";
import useMeasure from "react-use-measure";
import {
  useDragControls,
  useMotionValue,
  useAnimate,
  motion,
} from "framer-motion";
import { createReviewAction } from "@/app/home/my-activity/completed-jobs/actions";

export default function JobReview({ itemId, profileId }) {
  const [open, setOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (reviewText.trim()) {
      try {
        const result = await createReviewAction({
          itemId, // Pass itemId here
          profileId,
          rating,
          reviewText,
        });

        if (result.success) {
          alert(result.message || "Review submitted successfully!");
          setOpen(false);
          setReviewText("");
          setRating(0);
        } else {
          alert(result.error || "Failed to submit review.");
        }
      } catch (error) {
        console.error("Error submitting review:", error);
        alert("Something went wrong.");
      }
    } else {
      alert("Please provide your review.");
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-500"
      >
        Leave a Review
      </button>

      <DragCloseDrawer open={open} setOpen={setOpen}>
        <div className="mx-auto text-center space-y-4 text-neutral-400">
          <h2 className="text-xl mx-auto text-center font-bold text-neutral-200 mb-16">
            Your feedback is important to us!
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <textarea
              name="reviewText"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="rounded-md border-0 p-3 h-72 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder-black focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
              placeholder="Leave your review"
              required
            ></textarea>
            <input
              type="number"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="mt-2 p-2 rounded-md border"
              placeholder="Rating (1-5)"
            />
            <button
              type="submit"
              className="mt-4 mx-auto bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-500 w-56"
            >
              Submit Review
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
