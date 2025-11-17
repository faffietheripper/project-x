"use client";

import { useState, useTransition } from "react";
import { assignCarrierAction } from "@/app/home/organisations/[organisationId]/actions";
import { getWinningJobsAction } from "@/app/home/organisations/[organisationId]/actions";

export default function AssignCarrierModal({
  carrierOrgId,
}: {
  carrierOrgId: string;
}) {
  const [open, setOpen] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [isPending, startTransition] = useTransition();

  async function openModal() {
    const res = await getWinningJobsAction();
    setJobs(res);
    setOpen(true);
  }

  function handleAssign() {
    if (!selectedJob) return;

    startTransition(async () => {
      await assignCarrierAction(Number(selectedJob), carrierOrgId);
      setOpen(false);
    });
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={openModal}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Assign Carrier Job
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Assign Carrier Job</h2>

            {/* Select Job */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Select a job:
              </label>

              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">-- Select Job --</option>

                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.name}
                  </option>
                ))}

                {jobs.length === 0 && <option>No winning jobs</option>}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                disabled={isPending}
                onClick={handleAssign}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isPending ? "Assigning..." : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
