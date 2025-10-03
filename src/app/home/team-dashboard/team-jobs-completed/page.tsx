import Link from "next/link";
import { auth } from "@/auth";
import { database } from "@/db/database";
import { items, profiles } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import JobReview from "@/components/app/JobReview";

export default async function TeamCompletedJobsPage() {
  const session = await auth();

  if (!session?.user?.organisationId) {
    throw new Error("Unauthorized");
  }

  const organisationId = session.user.organisationId;

  // Fetch completed items where the organisation was either the owner OR the winning organisation
  const completedOrgItems = await database.query.items.findMany({
    where: and(
      eq(items.completed, true),
      or(
        eq(items.organisationId, organisationId), // org owned the item
        eq(items.winningOrganisationId, organisationId) // org won the item
      )
    ),
    with: {
      winningBid: true,
      winningOrganisation: true,
      organisation: true,
    },
  });

  // Map through completedOrgItems and fetch corresponding profiles
  const itemsWithProfiles = await Promise.all(
    completedOrgItems.map(async (item) => {
      // If organisation owns the item, then the "receiver" is the winning bidder.
      // If organisation is the winning bidder, then the "receiver" is the item owner.
      const receiverUserId =
        item.organisationId === organisationId
          ? item.winningBid?.userId
          : item.userId;

      if (!receiverUserId) {
        return { ...item, profile: null };
      }

      const profile = await database.query.profiles.findFirst({
        where: eq(profiles.userId, receiverUserId),
      });

      return { ...item, profile };
    })
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Completed Organisation Jobs</h1>

      <section>
        {itemsWithProfiles.length > 0 ? (
          <ul>
            {itemsWithProfiles.map((item) => (
              <li
                key={item.id}
                className="p-6 border rounded-lg shadow-sm mb-4"
              >
                <section className="flex justify-between">
                  <div className="md:w-[700px]">
                    <h1>Item Title: {item.name}</h1>
                    <h1>
                      Description:{" "}
                      {item.detailedDescription || "No description provided"}
                    </h1>
                    <p className="text-gray-600">
                      <strong>Owner Organisation:</strong>{" "}
                      {item.organisation?.teamName || "Unknown"}
                    </p>
                    <p className="text-gray-600">
                      <strong>Winning Organisation:</strong>{" "}
                      {item.winningOrganisation?.teamName || "Unknown"}
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <Link href={`/home/items/${item.id}`}>
                      <button className="bg-blue-500 w-full text-white px-4 py-2 rounded-md">
                        View Item
                      </button>
                    </Link>
                    {item.profile ? (
                      <JobReview itemId={item.id} profileId={item.profile.id} />
                    ) : (
                      <p>No valid profile found.</p>
                    )}
                  </div>
                </section>
              </li>
            ))}
          </ul>
        ) : (
          <p>No completed organisation jobs found.</p>
        )}
      </section>
    </div>
  );
}
