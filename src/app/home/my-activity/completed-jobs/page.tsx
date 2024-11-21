import Link from "next/link";
import { auth } from "@/auth";
import { database } from "@/db/database";
import { items } from "@/db/schema";
import { eq } from "drizzle-orm";
import JobReview from "@/components/app/JobReview";

export default async function CompletedJobsPage() {
  const session = await auth();
  console.log(session?.user.id);

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  // Step 1: Fetch completed items and include winning bid details
  const allCompletedItems = await database.query.items.findMany({
    where: eq(items.completed, true),
    with: {
      winningBid: true,
    },
  });

  // Step 2: Filter the completed items to show only those relevant to the logged-in user
  const completedJobs = allCompletedItems.filter(
    (item) =>
      item.userId === session.user.id ||
      item.winningBid?.userId === session.user.id
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Completed Jobs</h1>

      <section>
        {completedJobs.length > 0 ? (
          <ul>
            {completedJobs.map((item) => (
              <li
                key={item.id}
                className="p-6 border rounded-lg shadow-sm mb-4"
              >
                <section className="flex justify-between ">
                  <div className=" md:w-[700px]">
                    <h1>Job Title: {item.name} </h1>
                    <h1>
                      Description:
                      {item.detailedDescription || "No description provided"}
                    </h1>
                  </div>
                  <div className="flex space-x-4">
                    <Link href={`/home/items/${item.id}`}>
                      <button className="bg-blue-500 w-full text-white px-4 py-2 rounded-md">
                        View Item
                      </button>
                    </Link>
                    <JobReview profileId={item.winningBid?.profileId} />
                  </div>
                </section>
              </li>
            ))}
          </ul>
        ) : (
          <p>No completed jobs found.</p>
        )}
      </section>
    </div>
  );
}
