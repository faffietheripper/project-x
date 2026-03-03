// lib/orgDb.ts
export function withOrgScope<T>(
  orgId: string,
  query: (orgId: string) => Promise<T>,
) {
  if (!orgId) {
    throw new Error("Organisation context missing.");
  }

  return query(orgId);
}
