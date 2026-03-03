import { database } from "@/db/database";
import { wasteListings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWasteListing(listingId: number) {
  const listing = await database.query.wasteListings.findFirst({
    where: eq(wasteListings.id, listingId),

    with: {
      templateData: {
        with: {
          template: {
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
          },
        },
      },

      organisation: true,
      user: true,
    },
  });

  return listing;
}
