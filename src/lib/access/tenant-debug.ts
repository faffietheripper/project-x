import { AppUser } from "@/util/types";

export function logTenantQuery(
  tableName: string,
  user: AppUser,
  filters?: any,
) {
  if (process.env.NODE_ENV === "production") return;

  console.log("──────── TENANT QUERY ────────");
  console.log("TABLE:", tableName);
  console.log("USER ID:", user?.id);
  console.log("ROLE:", user?.role);
  console.log("ORG ID:", user?.organisationId);
  console.log("FILTERS:", filters);
  console.log("──────────────────────────────");
}
