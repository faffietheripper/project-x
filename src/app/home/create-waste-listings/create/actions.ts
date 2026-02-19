"use server";

import { revalidatePath } from "next/cache";
import { database } from "@/db/database";
import { wasteListings, users } from "@/db/schema";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSignedUrlForS3Object } from "@/lib/s3";
import { eq } from "drizzle-orm";

/* ===============================
   Generate Upload URLs
================================ */

export async function createUploadUrlAction(keys: string[], types: string[]) {
  if (keys.length !== types.length) {
    throw new Error("Keys and types array must be the same length.");
  }

  const signedUrls = await Promise.all(
    keys.map((key, index) => getSignedUrlForS3Object(key, types[index])),
  );

  return signedUrls;
}

/* ===============================
   Create Waste Listing
================================ */

export async function createItemAction({
  fileName,
  name,
  startingPrice,
  endDate,
  location,
  transportationDetails,
  transactionConditions,
  complianceDetails,
  detailedDescription,
}: {
  fileName: string[];
  name: string;
  startingPrice: number;
  endDate: Date;
  location: string;
  transportationDetails: string;
  transactionConditions: string;
  complianceDetails: string;
  detailedDescription: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user?.organisationId) {
    throw new Error("User organisation not found.");
  }

  await database.insert(wasteListings).values({
    name,
    startingPrice,
    currentBid: startingPrice,

    location,
    transportationDetails,
    transactionConditions,
    complianceDetails,
    detailedDescription,

    fileKey: fileName.join(","),

    userId: user.id,
    organisationId: user.organisationId,

    endDate,
  });

  revalidatePath("/home/waste-listings");

  redirect("/home/waste-listings");
}
