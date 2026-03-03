import { buildOrgScope } from "@/lib/org-scope";
import { AppUser } from "@/util/types";
import { database } from "@/db/database";
import { wasteListings } from "@/db/schema";

export async function getWasteListing(listingId: number, user: AppUser) {
  const listing = await database.query.wasteListings.findFirst({
    where: buildOrgScope(wasteListings, wasteListings.id, listingId, user),

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
