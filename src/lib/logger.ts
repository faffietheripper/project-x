import { database } from "@/db/database";
import { auditEvents } from "@/db/schema";

export async function logRequest(
  action: string,
  organisationId?: string,
  userId?: string,
  entityType?: string,
  entityId?: string,
) {
  console.log(`[${new Date().toISOString()}] ACTION=${action}`);

  try {
    await database.insert(auditEvents).values({
      organisationId: organisationId ?? "platform",
      userId,
      entityType: entityType ?? "system",
      entityId: entityId ?? "unknown",
      action,
    });
  } catch (error) {
    console.error("Audit log failed:", error);
  }
}

export function logError(context: string, error: unknown) {
  console.error(`[${new Date().toISOString()}] ERROR in ${context}`, error);
}
