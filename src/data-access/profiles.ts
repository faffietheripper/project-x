"use server";

import { database } from "@/db/database";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getProfileByUserId(userId: string) {
  const profile = await database.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
  return profile;
}
