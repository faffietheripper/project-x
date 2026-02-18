"use server";

import { database } from "@/db/database";
import { userProfiles, users } from "@/db/schema";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { getSignedUrlForS3Object } from "@/lib/s3";
import { eq } from "drizzle-orm";

/* =========================================================
   CREATE SIGNED UPLOAD URL
========================================================= */

export async function createUploadUrlAction(key: string, type: string) {
  if (!key || !type) return null;

  const signedUrl = await getSignedUrlForS3Object(key, type);
  return signedUrl;
}

/* =========================================================
   FETCH PROFILE
========================================================= */

export async function fetchProfileAction() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const profile = await database.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, session.user.id),
  });

  return profile ?? null;
}

/* =========================================================
   SAVE / UPDATE PROFILE
========================================================= */

export async function saveProfileAction(data: {
  profilePicture?: string;
  fullName: string;
  telephone?: string;
  emailAddress?: string;
  country?: string;
  streetAddress?: string;
  city?: string;
  region?: string;
  postCode?: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const existingProfile = await database.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
  });

  if (existingProfile) {
    await database
      .update(userProfiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId));
  } else {
    await database.insert(userProfiles).values({
      userId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  redirect("/home");
}

/* =========================================================
   ASSIGN ROLE
========================================================= */

export async function assignRoleAction(role: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (
    ![
      "administrator",
      "seniorManagement",
      "employee",
      "platform_admin",
    ].includes(role)
  ) {
    throw new Error("Invalid role selected");
  }

  await database
    .update(users)
    .set({ role })
    .where(eq(users.id, session.user.id));

  await signOut({
    redirectTo: "/",
  });
}
