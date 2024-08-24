"use server";

import { revalidatePath } from "next/cache";
import { database } from "@/db/database";
import { items } from "@/db/schema";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSignedUrlForS3Object } from "@/lib/s3";

export async function createUploadUrlAction(keys: string[], types: string[]) {
  if (keys.length !== types.length) {
    throw new Error("Keys and types array must be of the same length.");
  }

  const signedUrls = await Promise.all(
    keys.map((key, index) => getSignedUrlForS3Object(key, types[index]))
  );

  return signedUrls;
}

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

  if (!session) {
    throw new Error("Unauthorized");
  }

  const user = session.user;

  if (!user || !user.id) {
    throw new Error("Unauthorized");
  }

  await database.insert(items).values({
    location,
    transportationDetails,
    transactionConditions,
    complianceDetails,
    detailedDescription,
    name,
    startingPrice,
    fileKey: fileName,
    currentBid: startingPrice,
    userId: user.id,
    endDate,
  });

  redirect("/home/waste-listings");
}
