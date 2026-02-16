"use client";

import { useState } from "react";
import { createIncident } from "@/app/home/carrier-hub/waste-carriers/incidents-&-reports/actions";

interface Assignment {
  assignmentId: string;
  itemId: number;
  itemName: string;
  location: string;
  assignedAt: Date | null;
}

export default function IncidentModal({
  assignments = [],
}: {
  assignments?: Assignment[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    await createIncident({
      assignmentId: formData.get("assignmentId") as string,
      type: formData.get("type") as string,
      description: formData.get("description") as string,
    });

    setLoading(false);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-black text-white px-4 py-2 rounded-xl"
      >
        + Report Incident
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Report New Incident</h2>

            <form action={handleSubmit} className="space-y-4">
              {/* Assignment Dropdown */}
              <select
                name="assignmentId"
                required
                className="w-full border rounded-lg p-2"
              >
                <option value="">Select Job</option>

                {assignments.map((assignment) => (
                  <option
                    key={assignment.assignmentId}
                    value={assignment.assignmentId}
                  >
                    {assignment.itemName} — {assignment.location}{" "}
                    {assignment.assignedAt &&
                      ` (Assigned ${new Date(
                        assignment.assignedAt,
                      ).toLocaleDateString()})`}
                  </option>
                ))}
              </select>

              {/* Incident Type */}
              <select
                name="type"
                required
                className="w-full border rounded-lg p-2"
              >
                <option value="">Select incident type</option>
                <option value="contaminated_waste">Contaminated Waste</option>
                <option value="access_issue">Access Issue</option>
                <option value="quantity_mismatch">Quantity Mismatch</option>
                <option value="damaged_load">Damaged Load</option>
                <option value="other">Other</option>
              </select>

              {/* Description */}
              <textarea
                name="description"
                placeholder="Describe the issue..."
                required
                className="w-full border rounded-lg p-2"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-black text-white rounded-lg"
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
