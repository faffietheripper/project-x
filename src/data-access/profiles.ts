"use server";

import { database } from "@/db/database";
import { userProfiles } from "@/db/schema"; // ✅ changed
import { eq } from "drizzle-orm";

export async function getProfileByUserId(userId: string) {
  const profile = await database.query.userProfiles.findFirst({
    // ✅ changed
    where: eq(userProfiles.userId, userId), // ✅ changed
  });

  return profile;
}
