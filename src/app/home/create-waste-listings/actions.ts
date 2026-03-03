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
  templateData,
  fileName,
  startingPrice,
  endDate,
  name,
}: {
  templateId: string;
  templateData: Record<string, any>;
  fileName: string[];
  startingPrice: number;
  endDate: Date;
  name: string[];
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user?.organisationId) {
    throw new Error("User organisation not found.");
  }

  /* ===============================
     1️⃣ Fetch Template (Lock Version)
  ============================== */

  const template = await database.query.listingTemplates.findFirst({
    where: eq(listingTemplates.id, templateId),
  });

  if (!template) {
    throw new Error("Template not found.");
  }

  /* ===============================
     2️⃣ Create Waste Listing
  ============================== */

  const [listing] = await database
    .insert(wasteListings)
    .values({
      name, // or custom name if you want
      startingPrice,
      currentBid: startingPrice,

      fileKey: fileName.join(","),

      userId: user.id,
      organisationId: user.organisationId,

      templateId: template.id, // ✅ REQUIRED
      templateVersion: template.version, // ✅ REQUIRED

      endDate,
    })
    .returning();

  /* ===============================
     3️⃣ Save Template Data Snapshot
  ============================== */

  await database.insert(listingTemplateData).values({
    listingId: listing.id,
    templateId: template.id,
    templateVersion: template.version,
    dataJson: JSON.stringify(templateData),
  });

  revalidatePath("/home/waste-listings");
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
