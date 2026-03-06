"use server";

import { auth } from "@/auth";
import { database } from "@/db/database";
import { bids, wasteListings, userProfiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isBidOver } from "@/util/bids";
import { createNotification } from "../../notifications/actions";

/* =========================================================
   CREATE BID
========================================================= */

export async function createBidAction({
  amount,
  listingId,
}: {
  amount: number;
  listingId: string;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { error: "You must be logged in." };
  }

  const listing = await database.query.wasteListings.findFirst({
    where: eq(wasteListings.id, Number(listingId)),
  });

  if (!listing) {
    return { error: "Listing not found." };
  }

  if (await isBidOver(listing)) {
    return { error: "Auction is over." };
  }

  const profile = await database.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
  });

  if (!profile) {
    return { error: "Complete your profile before bidding." };
  }

  const user = await database.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user?.organisationId) {
    return { error: "User must belong to organisation." };
  }

  await database.transaction(async (tx) => {
    await tx.insert(bids).values({
      amount,
      listingId: listing.id,
      userId,
      organisationId: user.organisationId,
    });

    await tx
      .update(wasteListings)
      .set({ currentBid: amount })
      .where(eq(wasteListings.id, listing.id));

    if (listing.userId) {
      await createNotification(
        listing.userId,
        "New bid placed",
        `A new bid was placed on "${listing.name}"`,
        "NEW_BID",
        listing.id,
      );
    }
  });

  revalidatePath(`/home/waste-listings/${listingId}`);

  return { success: true };
}

/* =========================================================
   ASSIGN WINNING BID
========================================================= */

export async function handleAssignWinningBid(formData: FormData) {
  const listingId = Number(formData.get("listingId"));
  const bidId = Number(formData.get("bidId"));

  if (!listingId || !bidId) {
    return { success: false, message: "Invalid request." };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized." };
  }

  const listing = await database.query.wasteListings.findFirst({
    where: eq(wasteListings.id, listingId),
  });

  if (!listing) {
    return { success: false, message: "Listing not found." };
  }

  if (listing.organisationId !== session.user.organisationId) {
    return { success: false, message: "Not allowed." };
  }

  const bid = await database.query.bids.findFirst({
    where: eq(bids.id, bidId),
  });

  if (!bid) {
    return { success: false, message: "Bid not found." };
  }

  await database.transaction(async (tx) => {
    await tx
      .update(wasteListings)
      .set({
        winningBidId: bid.id,
        winningOrganisationId: bid.organisationId,
        assigned: true,
      })
      .where(eq(wasteListings.id, listingId));
  });

  revalidatePath(`/home/waste-listings/${listingId}`);

  return { success: true, message: "Winning bid assigned." };
}
