import { auth } from "@/auth";
import { AppUser } from "@/util/types";

export async function getCurrentUser(): Promise<AppUser> {
  const session = await auth();

  if (!session?.user) {
    throw new Error("User not authenticated.");
  }

  return session.user as AppUser;
}
