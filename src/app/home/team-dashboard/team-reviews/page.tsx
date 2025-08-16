import { auth } from "@/auth";
import { database } from "@/db/database";
import { reviews } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function TeamReviewsPage() {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  // Get organisationId from the logged-in user
  const organisationId = session.user.organisationId;
  if (!organisationId) {
    throw new Error("No organisation found for this user");
  }

  // Fetch all reviews for the organisation
  const organisationReviews = await database.query.reviews.findMany({
    where: eq(reviews.organisationId, organisationId),
    with: {
      reviewer: true, // user who wrote the review
      organisation: true, // organisation being reviewed
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Completed Reviews</h1>
      <section>
        {organisationReviews.length > 0 ? (
          <ul className="space-y-4">
            {organisationReviews.map((review) => (
              <li
                key={review.id}
                className="border rounded-lg p-4 shadow-sm bg-white"
              >
                <h2 className="text-lg font-semibold">
                  Reviewed By: {review.reviewer?.name || "Anonymous"}
                </h2>
                <p className="text-gray-600">
                  <strong>Organisation:</strong>{" "}
                  {review.organisation?.teamName || "Unknown"}
                </p>
                <p className="text-gray-600">
                  <strong>Rating:</strong> {review.rating} / 5
                </p>
                <p className="mt-2">{review.reviewText}</p>
                <p className="text-sm text-gray-400 mt-2">
                  {new Date(review.timestamp).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No reviews found for your organisation.</p>
        )}
      </section>
    </div>
  );
}
