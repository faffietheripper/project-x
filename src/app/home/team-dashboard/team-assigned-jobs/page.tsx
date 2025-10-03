import React from "react";
import { auth } from "@/auth";
import { database } from "@/db/database";
import { eq, isNotNull } from "drizzle-orm";
import { items } from "@/db/schema";
import Link from "next/link";

export default async function TeamAssignedJobs() {
  const session = await auth();

  if (!session?.user?.organisationId) {
    throw new Error("Unauthorized");
  }

  const organisationId = session.user.organisationId;

  // Step 1: Fetch all items where the winning bid is not null
  const itemsWithWinningBids = await database.query.items.findMany({
    where: isNotNull(items.winningBidId),
    with: {
      winningBid: true,
    },
  });

  // Step 2: Filter items -> exclude completed & match organisation
  const assignedJobs = itemsWithWinningBids.filter(
    (item) =>
      item.winningBid?.organisationId === organisationId &&
      item.completed === false
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Organisation Assigned Jobs</h1>
      {assignedJobs.length > 0 ? (
        assignedJobs.map((job) => (
          <div
            key={job.id}
            className="p-6 border flex justify-between rounded-lg shadow-sm mb-4"
          >
            <section>
              <div>
                <strong>Item:</strong> {job.name}
              </div>
              <div>
                <strong>Winning Bid Amount:</strong> ${job.winningBid.amount}
              </div>
              <div>
                <strong>Date:</strong>{" "}
                {new Date(job.winningBid.timestamp).toLocaleString()}
              </div>
              {job.offerAccepted ? (
                <h1 className="text-yellow-600 font-bold">Job in Progress</h1>
              ) : (
                <h1 className="text-green-600 font-bold">Job Assigned</h1>
              )}
            </section>

            {/* View Item Button Only */}
            <div className="mt-4 flex space-x-4">
              <Link href={`/home/items/${job.id}`}>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
                  View Item
                </button>
              </Link>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-600">
          Your organisation has no assigned jobs yet.
        </p>
      )}
    </div>
  );
}
