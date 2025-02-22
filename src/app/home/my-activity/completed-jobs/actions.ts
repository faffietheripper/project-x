"use server";
import { auth } from "@/auth";
import { database } from "@/db/database";
import { reviews, items, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createNotification } from "../../notifications/actions";

export async function createReviewAction({
  itemId,
  profileId,
  rating,
  reviewText,
}) {
  console.log("Received input for review action:", {
    itemId,
    profileId,
    rating,
    reviewText,
  });

  const session = await auth();
  const userId = session?.user?.id;

  // Validate required inputs early
  if (!userId) {
    return { error: "You must be logged in to leave a review." };
  }

  if (!itemId || !profileId || !rating || !reviewText) {
    console.error("Missing required fields:", {
      itemId,
      profileId,
      rating,
      reviewText,
    });
    throw new Error(
      "All fields (itemId, profileId, rating, reviewText) must be provided."
    );
  }

  // Fetch the item and its winning bid
  const item = await database.query.items.findFirst({
    where: eq(items.id, itemId),
    with: {
      winningBid: true,
    },
  });

  if (!item) {
    return { error: "Item not found." };
  }

  // Debug log to check if userId matches expected values
  console.log("Item details:", item);
  console.log("Item owner (userId):", item.userId);
  console.log(
    "Winning bid user (winningBid?.userId):",
    item.winningBid?.userId
  );

  // Validate authorization
  const isAuthorizedReviewer =
    item.userId === userId || item.winningBid?.userId === userId;

  if (!isAuthorizedReviewer) {
    return { error: "You are not authorized to leave a review for this item." };
  }

  // Prevent users from reviewing themselves
  if (userId === profileId) {
    return { error: "You cannot review yourself." };
  }

  // Fetch the profile being reviewed to get its userId
  const profile = await database.query.profiles.findFirst({
    where: eq(profiles.id, profileId),
  });

  if (!profile) {
    return { error: "Profile not found." };
  }

  const receiverId = profile.userId;

  // Ensure the receiver is not the reviewer
  if (receiverId === userId) {
    return { error: "You cannot send a notification to yourself." };
  }

  // Insert the review and trigger a notification
  try {
    const reviewData = {
      reviewerId: userId,
      profileId,
      rating,
      reviewText,
      timestamp: new Date(),
    };

    console.log("Review data to insert:", reviewData);

    await database.insert(reviews).values(reviewData);

    // Trigger a notification for the recipient of the review
    const title = "New Review Received!";
    const message = `You have received a review: "${reviewText}" with a rating of ${rating} stars.`;
    const itemUrl = `/profile/${profileId}/reviews`; // Link to the recipient's reviews

    await createNotification(receiverId, title, message, itemUrl);

    return { success: true, message: "Review submitted successfully." };
  } catch (error) {
    console.error("Error inserting review or sending notification:", error);
    throw new Error("Failed to create review.");
  }
}
