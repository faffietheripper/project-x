import React from "react";
import { auth } from "@/auth";
import { database } from "@/db/database";
import { eq } from "drizzle-orm";
import { items, users, carrierAssignments } from "@/db/schema";
import Link from "next/link";
import { acceptCarrierJobAction, rejectCarrierJobAction } from "./actions";

export default async function AssignedCarrierJobs() {
  console.log("🟡 AssignedCarrierJobs page loaded");

  const session = await auth();
  console.log("🟡 Session:", session);

  if (!session?.user?.id) {
    console.log("🔴 No session user ID");
    throw new Error("Unauthorized");
  }

  console.log("🟢 User ID:", session.user.id);

  const dbUser = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  console.log("🟡 DB User:", dbUser);

  if (!dbUser?.organisationId) {
    console.log("🔴 User has no organisation");
    throw new Error("User has no organisation");
  }

  console.log("🟢 Organisation ID:", dbUser.organisationId);

  console.log("🟡 Available query tables:", Object.keys(database.query));

  let assignments = [];

  try {
    assignments = await database.query.carrierAssignments.findMany({
      where: eq(
        carrierAssignments.carrierOrganisationId,
        dbUser.organisationId,
      ),
      with: {
        item: true,
      },
      orderBy: (ca, { desc }) => [desc(ca.assignedAt)],
    });

    console.log("🟢 Carrier assignments found:", assignments.length);
    console.log("🟢 Assignments data:", assignments);
  } catch (error) {
    console.error("🔴 Error querying carrierAssignments:", error);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Assigned Carrier Jobs</h1>

      {assignments.length > 0 ? (
        assignments.map(({ id, item, status }) => (
          <div
            key={id}
            className="p-6 border rounded-lg shadow-sm mb-4 flex justify-between"
          >
            <section>
              <div>
                <strong>Job:</strong> {item?.name ?? "NO ITEM"}
              </div>
              <div>
                <strong>Location:</strong> {item?.location ?? "N/A"}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <span className="capitalize">{status}</span>
              </div>
            </section>

            <div className="flex flex-col gap-2">
              <Link href={`/home/items/${item?.id}`}>
                <button className="bg-gray-600 text-white px-4 py-2 rounded-md">
                  View Job
                </button>
              </Link>

              {status === "pending" && (
                <>
                  <form action={acceptCarrierJobAction}>
                    <input type="hidden" name="itemId" value={item?.id} />
                    <button className="bg-green-600 text-white px-4 py-2 rounded-md">
                      Accept
                    </button>
                  </form>

                  <form action={rejectCarrierJobAction}>
                    <input type="hidden" name="itemId" value={item?.id} />
                    <button className="bg-red-600 text-white px-4 py-2 rounded-md">
                      Reject
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">
          No carrier jobs assigned to your organisation yet.
        </p>
      )}
    </div>
  );
}
