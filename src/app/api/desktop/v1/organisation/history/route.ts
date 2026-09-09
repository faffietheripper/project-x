import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import {
  clientDevices,
  clientEvidenceUploads,
  syncChangeFeed,
  syncEventInbox,
} from "@/db/client-sync-schema";
import { database } from "@/db/database";
import { jobLoads, jobs, users } from "@/db/schema";
import {
  requireClientApiContext,
  requireOperationsRole,
} from "@/lib/client-api/auth";
import {
  clientApiError,
  clientApiJson,
  handleClientApiError,
} from "@/lib/client-api/http";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  jobId: z.string().trim().min(1),
});

function eventLabel(eventType: string) {
  const labels: Record<string, string> = {
    JOB_CREATED: "Job created",
    LOAD_CREATED: "Load created",
    LOAD_DETAILS_UPDATED: "Load details / assignment updated",
    LOAD_ARRIVED: "Carrier arrived",
    LOAD_ACCEPTED: "Receiving site accepted",
    LOAD_REJECTED: "Load rejected",
    SITE_LOAD_REJECTED: "Receiving site rejected",
    FIELD_COLLECTION_REJECTED: "Driver refused collection",
    FIELD_COLLECTED: "Driver collected",
    FIELD_IN_TRANSIT: "Driver in transit",
    FIELD_ARRIVED_DESTINATION: "Arrived at destination",
    LOAD_COMPLETED: "Load completed",
    SITE_TICKET_ISSUED: "Site ticket issued",
    EVIDENCE_UPLOADED: "File / evidence attached",
    CANONICAL_CHANGE: "Canonical record changed",
  };

  return (
    labels[eventType] ??
    eventType
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

function iso(value: Date | null | undefined) {
  return value?.toISOString() ?? null;
}

export async function GET(request: Request) {
  try {
    const context = await requireClientApiContext(request);
    requireOperationsRole(context);

    const url = new URL(request.url);
    const parsed = querySchema.safeParse({
      jobId: url.searchParams.get("jobId"),
    });

    if (!parsed.success) {
      return clientApiError(
        "INVALID_RECORD_HISTORY_QUERY",
        400,
        "Choose a Waste X Job to inspect its record history.",
      );
    }

    const job = await database.query.jobs.findFirst({
      where: and(
        eq(jobs.id, parsed.data.jobId),
        eq(jobs.organisationId, context.organisationId),
      ),
      columns: {
        id: true,
        jobNumber: true,
        jobDate: true,
        direction: true,
        status: true,
        driverId: true,
        vehicleId: true,
        createdByUserId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!job) {
      return clientApiError(
        "JOB_NOT_FOUND",
        404,
        "That Waste X Job was not found for this organisation.",
      );
    }

    const loads = await database
      .select({
        id: jobLoads.id,
        loadNumber: jobLoads.loadNumber,
        status: jobLoads.status,
        direction: jobLoads.direction,
        driverId: jobLoads.driverId,
        vehicleId: jobLoads.vehicleId,
        ticketNumber: jobLoads.ticketNumber,
        createdByUserId: jobLoads.createdByUserId,
        createdAt: jobLoads.createdAt,
        updatedAt: jobLoads.updatedAt,
      })
      .from(jobLoads)
      .where(
        and(
          eq(jobLoads.organisationId, context.organisationId),
          eq(jobLoads.jobId, job.id),
        ),
      )
      .orderBy(asc(jobLoads.loadNumber));

    const loadIds = loads.map((load) => load.id);

    const jobInbox = await database
      .select()
      .from(syncEventInbox)
      .where(
        and(
          eq(syncEventInbox.organisationId, context.organisationId),
          eq(syncEventInbox.entityType, "job"),
          eq(syncEventInbox.entityId, job.id),
        ),
      )
      .orderBy(desc(syncEventInbox.occurredAt));

    const loadInbox = loadIds.length
      ? await database
          .select()
          .from(syncEventInbox)
          .where(
            and(
              eq(syncEventInbox.organisationId, context.organisationId),
              eq(syncEventInbox.entityType, "job_load"),
              inArray(syncEventInbox.entityId, loadIds),
            ),
          )
          .orderBy(desc(syncEventInbox.occurredAt))
      : [];

    const jobChanges = await database
      .select()
      .from(syncChangeFeed)
      .where(
        and(
          eq(syncChangeFeed.organisationId, context.organisationId),
          eq(syncChangeFeed.entityType, "job"),
          eq(syncChangeFeed.entityId, job.id),
        ),
      )
      .orderBy(desc(syncChangeFeed.sequence));

    const loadChanges = loadIds.length
      ? await database
          .select()
          .from(syncChangeFeed)
          .where(
            and(
              eq(syncChangeFeed.organisationId, context.organisationId),
              eq(syncChangeFeed.entityType, "job_load"),
              inArray(syncChangeFeed.entityId, loadIds),
            ),
          )
          .orderBy(desc(syncChangeFeed.sequence))
      : [];

    const jobFiles = await database
      .select({
        evidenceId: clientEvidenceUploads.evidenceId,
        entityType: clientEvidenceUploads.entityType,
        entityId: clientEvidenceUploads.entityId,
        fileName: clientEvidenceUploads.fileName,
        contentType: clientEvidenceUploads.contentType,
        byteSize: clientEvidenceUploads.byteSize,
        status: clientEvidenceUploads.status,
        uploadedAt: clientEvidenceUploads.uploadedAt,
        createdAt: clientEvidenceUploads.createdAt,
      })
      .from(clientEvidenceUploads)
      .where(
        and(
          eq(clientEvidenceUploads.organisationId, context.organisationId),
          eq(clientEvidenceUploads.entityType, "job"),
          eq(clientEvidenceUploads.entityId, job.id),
        ),
      )
      .orderBy(desc(clientEvidenceUploads.createdAt));

    const loadFiles = loadIds.length
      ? await database
          .select({
            evidenceId: clientEvidenceUploads.evidenceId,
            entityType: clientEvidenceUploads.entityType,
            entityId: clientEvidenceUploads.entityId,
            fileName: clientEvidenceUploads.fileName,
            contentType: clientEvidenceUploads.contentType,
            byteSize: clientEvidenceUploads.byteSize,
            status: clientEvidenceUploads.status,
            uploadedAt: clientEvidenceUploads.uploadedAt,
            createdAt: clientEvidenceUploads.createdAt,
          })
          .from(clientEvidenceUploads)
          .where(
            and(
              eq(clientEvidenceUploads.organisationId, context.organisationId),
              eq(clientEvidenceUploads.entityType, "job_load"),
              inArray(clientEvidenceUploads.entityId, loadIds),
            ),
          )
          .orderBy(desc(clientEvidenceUploads.createdAt))
      : [];

    const inboxRows = [...jobInbox, ...loadInbox];
    const changeRows = [...jobChanges, ...loadChanges];
    const files = [...jobFiles, ...loadFiles];

    const actorIds = Array.from(
      new Set(
        [
          job.createdByUserId,
          ...loads.map((load) => load.createdByUserId),
          ...inboxRows.map((event) => event.actorUserId),
        ].filter((value): value is string => Boolean(value)),
      ),
    );

    const deviceIds = Array.from(
      new Set(
        inboxRows
          .map((event) => event.deviceId)
          .filter((value): value is string => Boolean(value)),
      ),
    );

    const actorRows = actorIds.length
      ? await database
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
          })
          .from(users)
          .where(
            and(
              eq(users.organisationId, context.organisationId),
              inArray(users.id, actorIds),
            ),
          )
      : [];

    const deviceRows = deviceIds.length
      ? await database
          .select({
            id: clientDevices.id,
            displayName: clientDevices.displayName,
            deviceType: clientDevices.deviceType,
            platform: clientDevices.platform,
          })
          .from(clientDevices)
          .where(
            and(
              eq(clientDevices.organisationId, context.organisationId),
              inArray(clientDevices.id, deviceIds),
            ),
          )
      : [];

    const actors = new Map(actorRows.map((row) => [row.id, row]));
    const devices = new Map(deviceRows.map((row) => [row.id, row]));
    const loadNumbers = new Map(
      loads.map((load) => [load.id, load.loadNumber]),
    );

    const representedVersions = new Set(
      inboxRows
        .filter(
          (event) =>
            event.resultStatus === "APPLIED" &&
            event.resultEntityVersion !== null,
        )
        .map(
          (event) =>
            `${event.entityType}:${event.entityId}:${event.resultEntityVersion}`,
        ),
    );

    const events: Array<{
      id: string;
      occurredAt: string;
      source: "Desktop" | "Mobile" | "Cloud";
      eventType: string;
      label: string;
      entityType: string;
      entityId: string;
      loadNumber: number | null;
      resultStatus: string | null;
      reasonCode: string | null;
      version: number | null;
      actor: {
        id: string;
        name: string | null;
        email: string | null;
      } | null;
      device: {
        id: string;
        displayName: string;
        deviceType: string;
        platform: string;
      } | null;
      payload: unknown;
    }> = [];

    if (job.createdAt) {
      events.push({
        id: `job-created:${job.id}`,
        occurredAt: job.createdAt.toISOString(),
        source: "Cloud",
        eventType: "JOB_CREATED",
        label: eventLabel("JOB_CREATED"),
        entityType: "job",
        entityId: job.id,
        loadNumber: null,
        resultStatus: "APPLIED",
        reasonCode: null,
        version: null,
        actor: job.createdByUserId
          ? actors.get(job.createdByUserId) ?? null
          : null,
        device: null,
        payload: {
          jobNumber: job.jobNumber,
          jobDate: iso(job.jobDate),
          direction: job.direction,
          status: job.status,
          driverId: job.driverId,
          vehicleId: job.vehicleId,
        },
      });
    }

    for (const load of loads) {
      if (!load.createdAt) continue;

      events.push({
        id: `load-created:${load.id}`,
        occurredAt: load.createdAt.toISOString(),
        source: "Cloud",
        eventType: "LOAD_CREATED",
        label: eventLabel("LOAD_CREATED"),
        entityType: "job_load",
        entityId: load.id,
        loadNumber: load.loadNumber,
        resultStatus: "APPLIED",
        reasonCode: null,
        version: null,
        actor: load.createdByUserId
          ? actors.get(load.createdByUserId) ?? null
          : null,
        device: null,
        payload: {
          status: load.status,
          direction: load.direction,
          driverId: load.driverId,
          vehicleId: load.vehicleId,
          ticketNumber: load.ticketNumber,
        },
      });
    }

    for (const event of inboxRows) {
      const device = devices.get(event.deviceId) ?? null;

      events.push({
        id: `client-event:${event.eventId}`,
        occurredAt:
          event.occurredAt?.toISOString() ??
          event.recordedAt?.toISOString() ??
          new Date(0).toISOString(),
        source:
          device?.deviceType === "MOBILE" ? "Mobile" : "Desktop",
        eventType: event.eventType,
        label: eventLabel(event.eventType),
        entityType: event.entityType,
        entityId: event.entityId,
        loadNumber:
          event.entityType === "job_load"
            ? loadNumbers.get(event.entityId) ?? null
            : null,
        resultStatus: event.resultStatus,
        reasonCode: event.reasonCode ?? null,
        version: event.resultEntityVersion ?? null,
        actor: actors.get(event.actorUserId) ?? null,
        device,
        payload: event.payload,
      });
    }

    for (const change of changeRows) {
      const key = `${change.entityType}:${change.entityId}:${change.entityVersion}`;
      if (representedVersions.has(key)) continue;

      events.push({
        id: `canonical-change:${change.sequence}`,
        occurredAt:
          change.changedAt?.toISOString() ?? new Date(0).toISOString(),
        source: "Cloud",
        eventType: "CANONICAL_CHANGE",
        label: eventLabel("CANONICAL_CHANGE"),
        entityType: change.entityType,
        entityId: change.entityId,
        loadNumber:
          change.entityType === "job_load"
            ? loadNumbers.get(change.entityId) ?? null
            : null,
        resultStatus: "APPLIED",
        reasonCode: null,
        version: change.entityVersion,
        actor: null,
        device: null,
        payload: change.payload,
      });
    }

    for (const file of files) {
      events.push({
        id: `evidence:${file.evidenceId}`,
        occurredAt:
          file.uploadedAt?.toISOString() ??
          file.createdAt?.toISOString() ??
          new Date(0).toISOString(),
        source: "Cloud",
        eventType: "EVIDENCE_UPLOADED",
        label: eventLabel("EVIDENCE_UPLOADED"),
        entityType: file.entityType,
        entityId: file.entityId,
        loadNumber:
          file.entityType === "job_load"
            ? loadNumbers.get(file.entityId) ?? null
            : null,
        resultStatus: file.status,
        reasonCode: null,
        version: null,
        actor: null,
        device: null,
        payload: {
          evidenceId: file.evidenceId,
          fileName: file.fileName,
          contentType: file.contentType,
          byteSize: file.byteSize,
          status: file.status,
        },
      });
    }

    events.sort(
      (left, right) =>
        new Date(right.occurredAt).getTime() -
        new Date(left.occurredAt).getTime(),
    );

    return clientApiJson({
      ok: true,
      job: {
        id: job.id,
        jobNumber: job.jobNumber,
        jobDate: iso(job.jobDate),
        direction: job.direction,
        status: job.status,
        driverId: job.driverId,
        vehicleId: job.vehicleId,
        createdAt: iso(job.createdAt),
        updatedAt: iso(job.updatedAt),
      },
      loads: loads.map((load) => ({
        id: load.id,
        loadNumber: load.loadNumber,
        status: load.status,
        direction: load.direction,
        driverId: load.driverId,
        vehicleId: load.vehicleId,
        ticketNumber: load.ticketNumber,
        createdAt: iso(load.createdAt),
        updatedAt: iso(load.updatedAt),
      })),
      events,
      files,
      note:
        "Record history includes authoritative client sync events, canonical change-feed records, creation anchors and attached-file metadata available to Waste X.",
    });
  } catch (error) {
    return handleClientApiError(error);
  }
}
