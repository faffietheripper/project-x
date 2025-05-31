"use server";

import { database } from "@/db/database";
import { organisations, users } from "@/db/schema";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { getSignedUrlForS3Object } from "@/lib/s3";
import { eq } from "drizzle-orm";

// Upload URL action for S3-compatible services
export async function createUploadUrlAction(keys: string[], types: string[]) {
  if (keys.length !== types.length) {
    throw new Error("Keys and types array must be of the same length.");
  }

  const signedUrls = await Promise.all(
    keys.map((key, index) => getSignedUrlForS3Object(key, types[index]))
  );

  return signedUrls;
}

// ✅ Fetch organisation by user's membership
export async function fetchProfileAction() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = session.user.id;

  const user = await database.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      organisationId: true,
    },
  });

  if (!user?.organisationId) return null;

  const org = await database.query.organisations.findFirst({
    where: eq(organisations.id, user.organisationId),
  });

  return org || null;
}

// ✅ Save or update organisation and associate user
export async function saveProfileAction({
  profilePicture,
  teamName,
  chainOfCustody,
  industry,
  telephone,
  emailAddress,
  country,
  streetAddress,
  city,
  region,
  postCode,
}: {
  profilePicture: string;
  teamName: string;
  chainOfCustody: string;
  industry: string;
  telephone: string;
  emailAddress: string;
  country: string;
  streetAddress: string;
  city: string;
  region: string;
  postCode: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = session.user.id;

  const user = await database.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      organisationId: true,
    },
  });

  const existingOrgId = user?.organisationId;

  if (existingOrgId) {
    await database
      .update(organisations)
      .set({
        profilePicture,
        teamName,
        chainOfCustody,
        industry,
        telephone,
        emailAddress,
        country,
        streetAddress,
        city,
        region,
        postCode,
      })
      .where(eq(organisations.id, existingOrgId));
  } else {
    // Create new organisation and update user's organisationId + role
    const [newOrg] = await database
      .insert(organisations)
      .values({
        profilePicture,
        teamName,
        chainOfCustody,
        industry,
        telephone,
        emailAddress,
        country,
        streetAddress,
        city,
        region,
        postCode,
      })
      .returning();

    await database
      .update(users)
      .set({
        organisationId: newOrg.id,
        role: "administrator",
      })
      .where(eq(users.id, userId));
  }

  redirect("/home/my-activity");
}

// ✅ Assign a role within the organisation (not global user table)
export async function assignRoleAction({ role }: { role: string }) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = session.user.id;

  if (!["administrator", "seniorMember", "teamMember"].includes(role)) {
    throw new Error("Invalid role selected");
  }

  await database.update(users).set({ role }).where(eq(users.id, userId));

  await new Promise((resolve) => setTimeout(resolve, 3000));
  await signOut({ redirectTo: "/" });
}
