import React from "react";
import { auth } from "@/auth";
import { database } from "@/db/database";
import { eq } from "drizzle-orm";
import { wasteListings, users, carrierAssignments } from "@/db/schema";
import Link from "next/link";
import { acceptCarrierJobAction, rejectCarrierJobAction } from "./actions";
import CollectedForm from "@/components/app/WasteCarriers/CollectedForm";

export default async function AssignedCarrierJobs() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const dbUser = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!dbUser?.organisationId) {
    throw new Error("User has no organisation");
  }

  const assignments = await database.query.carrierAssignments.findMany({
    where: eq(carrierAssignments.carrierOrganisationId, dbUser.organisationId),
    with: {
      listing: true, // ✅ correct relation
    },
    orderBy: (ca, { desc }) => [desc(ca.assignedAt)],
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Assigned Carrier Jobs</h1>

      {assignments.length > 0 ? (
        assignments.map(({ id, listing, status }) => (
          <div
            key={id}
            className="p-6 border rounded-lg shadow-sm mb-4 flex justify-between"
          >
            <section>
              <div>
                <strong>Job:</strong> {listing?.name ?? "Unknown"}
              </div>

              <div>
                <strong>Location:</strong> {listing?.location ?? "N/A"}
              </div>

              <div>
                <strong>Status:</strong>{" "}
                <span className="capitalize">{status}</span>
              </div>
            </section>

            <div className="flex flex-col gap-2">
              {listing?.id && (
                <Link href={`/home/listings/${listing.id}`}>
                  <button className="bg-gray-600 text-white px-4 py-2 rounded-md">
                    View Job
                  </button>
                </Link>
              )}

              {/* 🔵 Pending → Accept / Reject */}
              {status === "pending" && listing?.id && (
                <>
                  <form action={acceptCarrierJobAction}>
                    <input type="hidden" name="listingId" value={listing.id} />
                    <button className="bg-green-600 text-white px-4 py-2 rounded-md">
                      Accept
                    </button>
                  </form>

                  <form action={rejectCarrierJobAction}>
                    <input type="hidden" name="listingId" value={listing.id} />
                    <button className="bg-red-600 text-white px-4 py-2 rounded-md">
                      Reject
                    </button>
                  </form>
                </>
              )}

              {/* 🟢 Accepted → Mark Collected */}
              {status === "accepted" && listing?.id && (
                <CollectedForm listingId={listing.id} />
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
