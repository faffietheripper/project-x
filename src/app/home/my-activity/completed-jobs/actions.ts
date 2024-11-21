"use server";

import { auth } from "@/auth";
import { database } from "@/db/database";
import { reviews, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createReviewAction({ profileId, rating, reviewText }) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { error: "You must be logged in to leave a review." };
  }

  const profile = await database.query.profiles.findFirst({
    where: eq(profiles.id, profileId),
  });

  if (!profile) {
    return { error: "Profile not found." };
  }

  try {
    await database.insert(reviews).values({
      reviewerId: userId,
      profileId,
      rating,
      reviewText,
      timestamp: new Date(),
    });

    revalidatePath(`/home/my-activity/reviews`);
    return { success: true, message: "Review submitted successfully." };
  } catch (error) {
    console.error("Error submitting review:", error);
    return { error: "Failed to submit review." };
  }
}
