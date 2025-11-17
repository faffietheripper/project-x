"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiTruck } from "react-icons/fi";
import { assignCarrierAction } from "@/app/home/organisations/[organisationId]/actions";
import { getWinningJobsAction } from "@/app/home/organisations/[organisationId]/actions";

export default function AssignCarrierModal({
  carrierOrgId,
}: {
  carrierOrgId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [isPending, startTransition] = useTransition();

  async function openModal() {
    const res = await getWinningJobsAction();
    setJobs(res);
    setIsOpen(true);
  }

  function handleAssign() {
    if (!selectedJob) return;

    startTransition(async () => {
      await assignCarrierAction(Number(selectedJob), carrierOrgId);
      setIsOpen(false);
    });
  }

  return (
    <>
      {/* OPEN BUTTON */}
      <button
        onClick={openModal}
        className=" bg-blue-600 text-white text-sm px-4 py-2 rounded hover:opacity-90 transition-opacity"
      >
        Assign Carrier Job
      </button>

      {/* MODAL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="bg-black/30 backdrop-blur p-8 fixed inset-0 z-50 flex justify-center items-start overflow-y-auto cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0, rotate: "12deg" }}
              animate={{ scale: 1, rotate: "0deg" }}
              exit={{ scale: 0, rotate: "0deg" }}
              transition={{ type: "spring", stiffness: 120, damping: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-lg w-full max-w-lg shadow-xl cursor-default relative overflow-hidden"
            >
              {/* BIG ICON BACKDROP */}
              <FiTruck className="text-white/10 rotate-12 text-[250px] absolute z-0 -top-24 -left-24" />

              <div className="relative z-10">
                {/* ICON */}
                <div className="bg-white w-16 h-16 mb-2 rounded-full text-3xl text-blue-600 grid place-items-center mx-auto">
                  <FiTruck />
                </div>

                <h3 className="text-3xl font-bold text-center mb-2">
                  Assign Carrier Job
                </h3>

                <p className="text-center mb-6 text-sm text-white/80">
                  Select one of your winning jobs below to assign it to this
                  carrier.
                </p>

                {/* JOB SELECT */}
                <div className="mb-4 text-black">
                  <label className="text-white text-sm">Select Job</label>
                  <select
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                    className="mt-1 w-full h-10 p-2 rounded-md border border-gray-300 text-sm"
                  >
                    <option value="">-- Select Job --</option>

                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.name}
                      </option>
                    ))}

                    {jobs.length === 0 && (
                      <option>No winning jobs available</option>
                    )}
                  </select>
                </div>

                {/* BUTTONS */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="bg-transparent hover:bg-white/10 transition-colors text-white font-semibold w-full py-2 rounded"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleAssign}
                    disabled={isPending}
                    className="bg-white text-blue-700 font-semibold w-full py-2 rounded hover:bg-transparent hover:text-white border border-white transition"
                  >
                    {isPending ? "Assigning..." : "Assign"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
