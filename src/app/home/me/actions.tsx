"use server";

import { database } from "@/db/database";
import { profiles, users } from "@/db/schema";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSignedUrlForS3Object } from "@/lib/s3";
import { eq } from "drizzle-orm";
import { signOut } from "@/auth";

// Create the upload URL action for Cloudflare R2 or any S3-compatible service
export async function createUploadUrlAction(keys: string[], types: string[]) {
  if (keys.length !== types.length) {
    throw new Error("Keys and types array must be of the same length.");
  }

  const signedUrls = await Promise.all(
    keys.map((key, index) => getSignedUrlForS3Object(key, types[index]))
  );

  return signedUrls;
}

// Fetch the existing profile action
export async function fetchProfileAction() {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const profileArray = await database
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId));

  return profileArray[0] || null;
}

// Save or update the profile action
export async function saveProfileAction({
  profilePicture,
  fullName,
  telephone,
  emailAddress,
  country,
  streetAddress,
  city,
  region,
  postCode,
}: {
  profilePicture: string;
  fullName: string;
  telephone: string;
  emailAddress: string;
  country: string;
  streetAddress: string;
  city: string;
  region: string;
  postCode: string;
}) {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const existingProfile = await fetchProfileAction();

  if (existingProfile) {
    await database
      .update(profiles)
      .set({
        profilePicture,
        fullName,
        telephone,
        emailAddress,
        country,
        streetAddress,
        city,
        region,
        postCode,
      })
      .where(eq(profiles.userId, userId));
  } else {
    await database.insert(profiles).values({
      userId: userId,
      profilePicture,
      fullName,
      telephone,
      emailAddress,
      country,
      streetAddress,
      city,
      region,
      postCode,
    });
  }

  redirect("/home/my-activity");
}

export async function assignRoleAction({ role }: { role: string }) {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const user = session.user;

  if (!user || !user.id) {
    throw new Error("Unauthorized");
  }

  if (!["administrator", "seniorMember", "teamMember"].includes(role)) {
    throw new Error("Invalid role selected");
  }

  await database.update(users).set({ role }).where(eq(users.id, user.id));

  await new Promise((resolve) => setTimeout(resolve, 3000));

  await signOut({
    redirectTo: "/",
  });
}
