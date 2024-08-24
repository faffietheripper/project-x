import { database } from "@/db/database";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getProfile(profileId: number) {
  const profile = await database.query.profiles.findFirst({
    where: eq(profiles.id, profileId),
  });
  return profile;
}
