import { wasteListings } from "@/db/schema";
import { database } from "@/db/database";
import { AppUser } from "@/util/types";
import { logTenantQuery } from "@/lib/access/tenant-debug";

export async function getWasteListing(listingId: number) {
  return database.query.wasteListings.findFirst({
    where: (table, { eq }) => eq(table.id, listingId),

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
}
