import React from "react";
import { auth } from "@/auth";
import { database } from "@/db/database";
import { carrierAssignments, users } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import ManagerCompletionForm from "@/components/app/WasteCarriers/ManagerCompletionForm";

export default async function JobAssignments() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const dbUser = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!dbUser?.organisationId) throw new Error("No organisation found");

  const assignments = await database.query.carrierAssignments.findMany({
    where: and(
      eq(carrierAssignments.assignedByOrganisationId, dbUser.organisationId),
      or(
        eq(carrierAssignments.status, "collected"),
        eq(carrierAssignments.status, "completed"),
      ),
    ),
    with: {
      item: true,
      carrierOrganisation: true,
    },
    orderBy: (ca, { desc }) => [desc(ca.collectedAt)],
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Carrier Job Lifecycle</h1>

      {assignments.length === 0 && (
        <p className="text-gray-500">No carrier job activity yet.</p>
      )}

      {assignments.map((assignment) => {
        const isCompleted = assignment.status === "completed";

        return (
          <div
            key={assignment.id}
            className={`p-6 border rounded-xl shadow-sm mb-6 ${
              isCompleted ? "bg-green-50 border-green-200" : ""
            }`}
          >
            {/* ===== JOB DETAILS ===== */}
            <div className="mb-4 space-y-1">
              <div className="text-lg font-semibold">
                {assignment.item?.name}
              </div>

              <div className="text-sm text-gray-600">
                📍 {assignment.item?.location}
              </div>

              <div className="text-sm">
                <strong>Carrier:</strong>{" "}
                {assignment.carrierOrganisation?.teamName}
              </div>

              <div className="text-sm">
                <strong>Collected:</strong>{" "}
                {assignment.collectedAt?.toLocaleDateString()}
              </div>

              {assignment.completedAt && (
                <div className="text-sm">
                  <strong>Completed:</strong>{" "}
                  {assignment.completedAt.toLocaleDateString()}
                </div>
              )}

              <div className="text-sm">
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded-md text-xs capitalize ${
                    isCompleted
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {assignment.status}
                </span>
              </div>
            </div>

            {/* ===== DESCRIPTION ===== */}
            <div className="mb-4 text-sm">
              <strong>Description:</strong>{" "}
              {assignment.item?.detailedDescription}
            </div>

            {/* ✅ Only show completion form if still awaiting completion */}
            {!isCompleted && (
              <ManagerCompletionForm itemId={assignment.itemId} />
            )}

            {/* ✅ Completed indicator */}
            {isCompleted && (
              <div className="text-sm font-medium text-green-700">
                ✅ Transfer fully completed.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
