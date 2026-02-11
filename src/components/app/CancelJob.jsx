"use client";

import React, { useState } from "react";
import { motion, useMotionValue, useDragControls } from "framer-motion";
import { cancelJobAction } from "@/app/home/my-activity/assigned-jobs/actions";

export default function CancelJobPage({ itemId, bidId }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const y = useMotionValue(0);
  const controls = useDragControls();

  const handleCancel = async (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      alert("Please provide a cancellation reason.");
      return;
    }

    setLoading(true);

    const result = await cancelJobAction({
      itemId,
      bidId,
      cancellationReason: reason,
    });

    setLoading(false);

    if (result.success) {
      alert(result.message);
      setOpen(false);
      setReason("");
    } else {
      alert(result.message);
    }
  };

  const closeDrawer = () => {
    setOpen(false);
    setReason("");
  };

  return (
    <div className="relative">
      {/* Cancel Button */}
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition"
      >
        Cancel Job
      </button>

      {/* Drawer */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={closeDrawer}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{ ease: "easeInOut" }}
            drag="y"
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={() => {
              if (y.get() > 120) closeDrawer();
            }}
            style={{ y }}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 w-full h-[75vh] rounded-t-3xl bg-neutral-900 border-t border-neutral-800 shadow-2xl"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-4">
              <button
                onPointerDown={(e) => controls.start(e)}
                className="h-1.5 w-12 rounded-full bg-neutral-600"
              />
            </div>

            {/* Content */}
            <div className="max-w-2xl mx-auto px-6 pt-8 pb-12 overflow-y-auto h-full">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Cancel This Job
                </h2>
                <p className="text-sm text-neutral-400">
                  This will relist the waste item and allow new bids.
                </p>
              </div>

              {/* Warning */}
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm p-4 rounded-xl mb-6">
                ⚠️ This action cannot be undone. Please provide a valid reason
                for audit and compliance purposes.
              </div>

              {/* Form */}
              <form onSubmit={handleCancel} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Cancellation Reason
                  </label>

                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explain why this job is being cancelled..."
                    className="w-full h-40 rounded-xl bg-neutral-800 border border-neutral-700 p-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                    required
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="px-4 py-2 rounded-lg bg-neutral-700 text-neutral-200 hover:bg-neutral-600 transition"
                  >
                    Keep Job
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-500 transition disabled:opacity-50"
                  >
                    {loading ? "Cancelling..." : "Confirm Cancellation"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
