"use server";

import { revalidatePath } from "next/cache";
import { database } from "@/db/database";
import { wasteListings, users, listingTemplates } from "@/db/schema";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSignedUrlForS3Object } from "@/lib/s3";
import { eq } from "drizzle-orm";
import { listingTemplateData } from "@/db/schema";
import { requireOrgUser } from "@/lib/require-org-user";

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

export async function createListingAction({
  templateId,
  templateVersion,
  templateData,
  fileName,
  startingPrice,
  endDate,
}: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  const [listing] = await database
    .insert(wasteListings)
    .values({
      name: "Template Based Listing",
      startingPrice,
      currentBid: startingPrice,
      fileKey: fileName.join(","),
      userId: user!.id,
      organisationId: user!.organisationId!,
      endDate,
    })
    .returning();

  await database.insert(listingTemplateData).values({
    listingId: listing.id,
    templateId,
    templateVersion,
    dataJson: JSON.stringify(templateData),
  });

  redirect("/home/waste-listings");
}

export async function getTemplateWithStructure(templateId: string) {
  await requireOrgUser();

  return database.query.listingTemplates.findFirst({
    where: eq(listingTemplates.id, templateId),
    with: {
      sections: {
        orderBy: (sections, { asc }) => [asc(sections.orderIndex)],
        with: {
          fields: {
            orderBy: (fields, { asc }) => [asc(fields.orderIndex)],
          },
        },
      },
    },
  });
}
