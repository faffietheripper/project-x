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
export async function saveProfileAction(formData: FormData) {
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

  // 🧩 Extract all fields explicitly from the form
  const profilePicture = formData.get("profilePicture") as string | null;
  const teamName = formData.get("teamName") as string | null;
  const chainOfCustody = formData.get("chainOfCustody") as string | null;
  const industry = formData.get("industry") as string | null;
  const telephone = formData.get("telephone") as string | null;
  const emailAddress = formData.get("emailAddress") as string | null;
  const country = formData.get("country") as string | null;
  const streetAddress = formData.get("streetAddress") as string | null;
  const city = formData.get("city") as string | null;
  const region = formData.get("region") as string | null;
  const postCode = formData.get("postCode") as string | null;

  // 🛡 Only include values that actually exist
  const updateData = {
    ...(profilePicture && { profilePicture }),
    ...(teamName && { teamName }),
    ...(chainOfCustody && { chainOfCustody }),
    ...(industry && { industry }),
    ...(telephone && { telephone }),
    ...(emailAddress && { emailAddress }),
    ...(country && { country }),
    ...(streetAddress && { streetAddress }),
    ...(city && { city }),
    ...(region && { region }),
    ...(postCode && { postCode }),
  };

  if (Object.keys(updateData).length === 0) {
    throw new Error(
      "No values to set — check that your form is sending fields correctly."
    );
  }

  if (existingOrgId) {
    // ✅ Update existing org
    await database
      .update(organisations)
      .set(updateData)
      .where(eq(organisations.id, existingOrgId));
  } else {
    // ✅ Create new org + assign user
    const [newOrg] = await database
      .insert(organisations)
      .values(updateData)
      .returning();

    await database
      .update(users)
      .set({
        organisationId: newOrg.id,
        role: "administrator",
      })
      .where(eq(users.id, userId));
  }

  // 🧩 Wait a moment before logging out (optional UX delay)
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // ✅ Log the user out (like assignRoleAction)
  await signOut({ redirectTo: "/login" }); // You can change "/login" to "/" or another page
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
