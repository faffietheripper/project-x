import Link from "next/link";
import { auth } from "@/auth";
import { database } from "@/db/database";
import { items, profiles } from "@/db/schema"; // Assuming profiles is the correct schema
import { eq } from "drizzle-orm";
import JobReview from "@/components/app/JobReview";

export default async function CompletedJobsPage() {
  const session = await auth();
  console.log(session?.user.id);

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  // Fetch completed items and include winning bid details
  const allCompletedItems = await database.query.items.findMany({
    where: eq(items.completed, true),
    with: {
      winningBid: true,
    },
  });

  // Filter completed items relevant to the logged-in user
  const completedItems = allCompletedItems.filter(
    (item) =>
      item.userId === session.user.id ||
      item.winningBid?.userId === session.user.id
  );

  // Map through completedItems and fetch corresponding profiles for each
  const itemsWithProfiles = await Promise.all(
    completedItems.map(async (item) => {
      const receiverUserId =
        item.userId === session.user.id
          ? item.winningBid?.userId // If item owner, receiver is winning bidder
          : item.userId; // Otherwise, receiver is item owner

      if (!receiverUserId) {
        return { ...item, profile: null }; // Handle case where there's no valid receiver
      }

      // Fetch profile based on userId (UUID) to get numeric profileId
      const profile = await database.query.profiles.findFirst({
        where: eq(profiles.userId, receiverUserId),
      });

      return { ...item, profile };
    })
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Completed Items</h1>

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
                    <h1>Item Title: {item.name}</h1>{" "}
                    {/* Using item.name here */}
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
                      <JobReview
                        itemId={item.id}
                        organisationId={item.organisationId} // or item.winningOrganisationId, depending on context
                      />
                    ) : (
                      <p>No valid profile found.</p>
                    )}
                  </div>
                </section>
              </li>
            ))}
          </ul>
        ) : (
          <p>No completed items found.</p>
        )}
      </section>
    </div>
  );
}
