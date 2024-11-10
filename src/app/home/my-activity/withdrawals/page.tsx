import Link from "next/link";
import { auth } from "@/auth";
import { database } from "@/db/database";
import { bids, items } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function WithdrawalsPage() {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  // Step 1: Fetch all bids where declinedOffer is true and relate to items posted by the logged-in user
  const allDeclinedOffers = await database.query.bids.findMany({
    where: eq(bids.declinedOffer, true),
    with: {
      item: true, // Include related item data
    },
  });

  // Step 2: Fetch all bids where cancelledJob is true and relate to items posted by the logged-in user
  const allCancelledJobs = await database.query.bids.findMany({
    where: eq(bids.cancelledJob, true),
    with: {
      item: true, // Include related item data
    },
  });

  // Step 3: Filter the declined offers to match the logged-in user's ID based on the item.userId
  const declinedOffers = allDeclinedOffers.filter(
    (bid) => bid.item.userId === session.user.id
  );

  // Step 4: Filter the cancelled jobs to match the logged-in user's ID based on the item.userId
  const cancelledJobs = allCancelledJobs.filter(
    (bid) => bid.item.userId === session.user.id
  );

  console.log("Declined Offers:", declinedOffers);
  console.log("Cancelled Jobs:", cancelledJobs);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Withdrawals</h1>

      {/* Declined Offers Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Declined Offers</h2>
        {declinedOffers.length > 0 ? (
          <ul>
            {declinedOffers.map((bid) => (
              <li key={bid.id} className="p-6 border rounded-lg shadow-sm mb-4">
                <div>
                  <strong>Bid for:</strong> {bid.itemName}
                </div>
                <div>
                  <strong>Amount:</strong> ${bid.amount}
                </div>
                <div>
                  <strong>Status:</strong> Declined
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No declined offers found.</p>
        )}
      </section>

      {/* Cancelled Jobs Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Cancelled Jobs</h2>
        {cancelledJobs.length > 0 ? (
          <ul>
            {cancelledJobs.map((bid) => (
              <li key={bid.id} className="p-6 border rounded-lg shadow-sm mb-4">
                <div>
                  <strong>Bid for:</strong> {bid.itemName}
                </div>
                <div>
                  <strong>Amount:</strong> ${bid.amount}
                </div>
                <div>
                  <strong>Status:</strong> Cancelled
                </div>
                <div>
                  <strong>Reason:</strong> {bid.cancellationReason || "N/A"}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No cancelled jobs found.</p>
        )}
      </section>
    </div>
  );
}
