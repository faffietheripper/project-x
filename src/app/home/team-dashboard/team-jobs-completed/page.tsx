import Link from "next/link";
import { auth } from "@/auth";
import { database } from "@/db/database";
import { items, profiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import JobReview from "@/components/app/JobReview";

export default async function TeamCompletedJobsPage() {
  const session = await auth();

  if (!session?.user?.organisationId) {
    throw new Error("Unauthorized");
  }

  // Fetch completed items for this organisation
  const completedOrgItems = await database.query.items.findMany({
    where: and(
      eq(items.organisationId, session.user.organisationId),
      eq(items.completed, true)
    ),
    with: {
      winningBid: true,
    },
  });

  // Map through completedOrgItems and fetch corresponding profiles
  const itemsWithProfiles = await Promise.all(
    completedOrgItems.map(async (item) => {
      const receiverUserId =
        item.organisationId === session.user.organisationId
          ? item.winningBid?.userId // If org owner, receiver is winning bidder
          : item.userId; // Otherwise, receiver is item owner

      if (!receiverUserId) {
        return { ...item, profile: null };
      }

      // Fetch profile for the receiver
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
