import { auth } from "@/auth";
import { database } from "@/db/database";
import { bids } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export default async function TeamWithdrawalsPage() {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  // Get organisationId from the logged-in user
  const organisationId = session.user.organisationId;
  if (!organisationId) {
    throw new Error("No organisation found for this user");
  }

  // Fetch declined offers for the organisation (either as item owner or bidder)
  const declinedOffers = await database.query.bids.findMany({
    where: eq(bids.declinedOffer, true),
    with: {
      item: true,
      organisation: true,
    },
  });

  // Fetch cancelled jobs for the organisation
  const cancelledJobs = await database.query.bids.findMany({
    where: eq(bids.cancelledJob, true),
    with: {
      item: true,
      organisation: true,
    },
  });

  // Filter so we only keep bids relevant to this organisation
  const organisationDeclinedOffers = declinedOffers.filter(
    (bid) =>
      bid.organisationId === organisationId || // Organisation placed the bid
      bid.item.organisationId === organisationId // Organisation owns the item
  );

  const organisationCancelledJobs = cancelledJobs.filter(
    (bid) =>
      bid.organisationId === organisationId || // Organisation placed the bid
      bid.item.organisationId === organisationId // Organisation owns the item
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Withdrawals</h1>

      {/* Declined Offers Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Declined Offers</h2>
        {organisationDeclinedOffers.length > 0 ? (
          <ul>
            {organisationDeclinedOffers.map((bid) => (
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
                <div>
                  <strong>Organisation:</strong>{" "}
                  {bid.organisation?.teamName || "Unknown"}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No declined offers found for your organisation.</p>
        )}
      </section>

      {/* Cancelled Jobs Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Cancelled Jobs</h2>
        {organisationCancelledJobs.length > 0 ? (
          <ul>
            {organisationCancelledJobs.map((bid) => (
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
                <div>
                  <strong>Organisation:</strong>{" "}
                  {bid.organisation?.teamName || "Unknown"}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No cancelled jobs found for your organisation.</p>
        )}
      </section>
    </div>
  );
}
