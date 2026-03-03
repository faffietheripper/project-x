// lib/org-scope.ts

import { eq, and } from "drizzle-orm";
import { isPlatformAdmin } from "./auth-utils";

export function buildOrgScope<T>(
  table: any,
  idField: any,
  idValue: any,
  user: { organisationId: string | null; role: string },
) {
  if (isPlatformAdmin(user)) {
    // Platform admin sees across tenants
    return eq(idField, idValue);
  }

  if (!user.organisationId) {
    throw new Error("Organisation context missing.");
  }

  return and(
    eq(idField, idValue),
    eq(table.organisationId, user.organisationId),
  );
}
