import Link from "next/link";
import { auth } from "@/auth";
import { database } from "@/db/database";
import { wasteListings, carrierAssignments, userProfiles } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";
import JobReview from "@/components/app/JobReview";

export default async function TeamCompletedJobsPage() {
  const session = await auth();

  if (!session?.user?.organisationId) {
    throw new Error("Unauthorized");
  }

  const organisationId = session.user.organisationId;

  // ✅ Fetch completed assignments linked to this organisation
  const completedAssignments = await database.query.carrierAssignments.findMany(
    {
      where: eq(carrierAssignments.status, "completed"),
      with: {
        listing: {
          with: {
            organisation: true,
            winningOrganisation: true,
            bids: true,
          },
        },
      },
    },
  );

  // ✅ Filter assignments where this org was involved
  const relevantAssignments = completedAssignments.filter(
    (assignment) =>
      assignment.listing?.organisationId === organisationId ||
      assignment.listing?.winningOrganisationId === organisationId,
  );

  // ✅ Attach receiver profile
  const assignmentsWithProfiles = await Promise.all(
    relevantAssignments.map(async (assignment) => {
      const listing = assignment.listing;

      if (!listing) return { ...assignment, profile: null };

      const receiverUserId =
        listing.organisationId === organisationId
          ? listing.bids?.find(
              (b) => b.organisationId === listing.winningOrganisationId,
            )?.userId
          : listing.userId;

      if (!receiverUserId) {
        return { ...assignment, profile: null };
      }

      const profile = await database.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, receiverUserId),
      });

      return { ...assignment, profile };
    }),
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Completed Organisation Jobs</h1>

      {assignmentsWithProfiles.length > 0 ? (
        <ul>
          {assignmentsWithProfiles.map((assignment) => {
            const listing = assignment.listing;

            return (
              <li
                key={assignment.id}
                className="p-6 border rounded-lg shadow-sm mb-4"
              >
                <section className="flex justify-between">
                  <div className="md:w-[700px]">
                    <h1>Listing Title: {listing?.name}</h1>
                    <h1>
                      Description:{" "}
                      {listing?.detailedDescription ||
                        "No description provided"}
                    </h1>

                    <p className="text-gray-600">
                      <strong>Owner Organisation:</strong>{" "}
                      {listing?.organisation?.teamName || "Unknown"}
                    </p>

                    <p className="text-gray-600">
                      <strong>Winning Organisation:</strong>{" "}
                      {listing?.winningOrganisation?.teamName || "Unknown"}
                    </p>

                    <p className="text-green-600 font-bold mt-2">Completed</p>
                  </div>

                  <div className="flex space-x-4">
                    <Link href={`/home/listings/${listing?.id}`}>
                      <button className="bg-blue-500 w-full text-white px-4 py-2 rounded-md">
                        View Listing
                      </button>
                    </Link>

                    {assignment.profile ? (
                      <JobReview
                        itemId={listing?.id}
                        organisationId={
                          listing?.organisationId === organisationId
                            ? listing?.winningOrganisationId!
                            : listing?.organisationId!
                        }
                      />
                    ) : (
                      <p>No valid profile found.</p>
                    )}
                  </div>
                </section>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No completed organisation jobs found.</p>
      )}
    </div>
  );
}
