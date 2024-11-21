import { auth } from "@/auth";
import { database } from "@/db/database";
import { reviews, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function ReviewsPage() {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const allReviews = await database.query.reviews.findMany({
    with: {
      reviewer: true,
      profile: true,
    },
  });

  const userReviews = allReviews.filter(
    (review) =>
      review.reviewerId === userId || review.profileId === review.profile?.id
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Completed Reviews</h1>
      <section>
        {userReviews.length > 0 ? (
          <ul className="space-y-4">
            {userReviews.map((review) => (
              <li
                key={review.id}
                className="border rounded-lg p-4 shadow-sm bg-white"
              >
                <h2 className="text-lg font-semibold">
                  Reviewed By: {review.reviewer?.name || "Anonymous"}
                </h2>
                <p className="text-gray-600">
                  <strong>Receiver:</strong>{" "}
                  {review.profile?.companyName || "Anonymous"}
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
          <p>No reviews found.</p>
        )}
      </section>
    </div>
  );
}
