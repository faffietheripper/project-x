import { and, eq } from "drizzle-orm";
import { database } from "@/db/database";
import { isPlatformAdmin } from "@/lib/auth-utils";
import { AppUser } from "@/util/types";

export function tenantDB(user: AppUser) {
  function scope(table: any) {
    if (isPlatformAdmin(user)) {
      return undefined; // platform admin bypass
    }

    if (!user.organisationId) {
      throw new Error("User organisation missing.");
    }

    return eq(table.organisationId, user.organisationId);
  }

  async function findFirst(table: any, config: any) {
    const tenantFilter = scope(table);

    return database.query[table._.name].findFirst({
      ...config,
      where: tenantFilter
        ? and(config.where ?? undefined, tenantFilter)
        : config.where,
    });
  }

  async function findMany(table: any, config: any) {
    const tenantFilter = scope(table);

    return database.query[table._.name].findMany({
      ...config,
      where: tenantFilter
        ? and(config.where ?? undefined, tenantFilter)
        : config.where,
    });
  }

  return {
    findFirst,
    findMany,
  };
}
