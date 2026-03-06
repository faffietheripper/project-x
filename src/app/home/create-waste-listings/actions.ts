"use server";

import { revalidatePath } from "next/cache";
import { database } from "@/db/database";
import {
  wasteListings,
  listingTemplates,
  listingTemplateData,
} from "@/db/schema";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSignedUrlForS3Object } from "@/lib/s3";
import { eq } from "drizzle-orm";
import { requireOrgUser } from "@/lib/access/require-org-user";

/* =========================================================
   GENERATE UPLOAD URLS
========================================================= */

export async function createUploadUrlAction(keys: string[], types: string[]) {
  if (keys.length !== types.length) {
    throw new Error("Keys and types array must match.");
  }

  const signedUrls = await Promise.all(
    keys.map((key, i) => getSignedUrlForS3Object(key, types[i])),
  );

  return signedUrls;
}

/* =========================================================
   CREATE LISTING
========================================================= */

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
  name: string;
}) {
  const session = await auth();

  if (!session?.user?.id || !session?.user?.organisationId) {
    throw new Error("Unauthorized");
  }

  const organisationId = session.user.organisationId;
  const userId = session.user.id;

  const template = await database.query.listingTemplates.findFirst({
    where: eq(listingTemplates.id, templateId),
  });

  if (!template) {
    throw new Error("Template not found.");
  }

  await database.transaction(async (tx) => {
    const [listing] = await tx
      .insert(wasteListings)
      .values({
        name,
        startingPrice,
        currentBid: startingPrice,
        fileKey: fileName.join(","),

        userId,
        organisationId,

        templateId: template.id,
        templateVersion: template.version,

        endDate,
      })
      .returning();

    await tx.insert(listingTemplateData).values({
      organisationId,
      listingId: listing.id,
      templateId: template.id,
      templateVersion: template.version,
      dataJson: JSON.stringify(templateData),
    });
  });

  revalidatePath("/home/waste-listings");
  redirect("/home/waste-listings");
}

/* =========================================================
   LOAD TEMPLATE STRUCTURE
========================================================= */

export async function getTemplateWithStructure(templateId: string) {
  await requireOrgUser();

  const template = await database.query.listingTemplates.findFirst({
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

  if (!template) {
    throw new Error("Template not found.");
  }

  return template;
}
