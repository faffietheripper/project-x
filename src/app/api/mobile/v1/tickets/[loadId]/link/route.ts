import { and, eq } from "drizzle-orm";

import { clientDevices } from "@/db/client-sync-schema";
import { database } from "@/db/database";
import { drivers, jobLoads, jobs } from "@/db/schema";
import {
  ClientApiAuthError,
  requireClientApiContext,
  requireMobileAccess,
} from "@/lib/client-api/auth";
import {
  clientApiError,
  clientApiJson,
  handleClientApiError,
} from "@/lib/client-api/http";
import { createMobileTicketLinkToken } from "@/lib/client-api/mobile-ticket-link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { loadId: string } },
) {
  try {
    const context = await requireClientApiContext(request);
    await requireMobileAccess(context);

    const device = await database.query.clientDevices.findFirst({
      where: and(
        eq(clientDevices.id, context.deviceId),
        eq(clientDevices.organisationId, context.organisationId),
        eq(clientDevices.deviceType, "MOBILE"),
        eq(clientDevices.status, "ACTIVE"),
      ),
      columns: { id: true },
    });
    if (!device) {
      throw new ClientApiAuthError(
        "MOBILE_DEVICE_REQUIRED",
        403,
        "Ticket documents are available only to an authorised Waste X Mobile device.",
      );
    }

    const matchedDrivers = await database
      .select({ id: drivers.id })
      .from(drivers)
      .where(
        and(
          eq(drivers.organisationId, context.organisationId),
          eq(drivers.linkedUserId, context.userId),
          eq(drivers.isActive, true),
        ),
      )
      .limit(2);

    if (matchedDrivers.length !== 1) {
      return clientApiError(
        "MOBILE_DRIVER_SCOPE_UNAVAILABLE",
        403,
        "Waste X Mobile could not resolve this account to one explicitly linked active Driver.",
      );
    }

    const load = await database.query.jobLoads.findFirst({
      where: and(
        eq(jobLoads.id, params.loadId),
        eq(jobLoads.organisationId, context.organisationId),
      ),
      columns: {
        id: true,
        jobId: true,
        driverId: true,
        status: true,
        ticketNumber: true,
      },
    });
    if (!load) {
      return clientApiError("TICKET_NOT_FOUND", 404, "This Waste X ticket is unavailable.");
    }

    const parentJob = await database.query.jobs.findFirst({
      where: and(
        eq(jobs.id, load.jobId),
        eq(jobs.organisationId, context.organisationId),
      ),
      columns: { driverId: true },
    });

    const assignedDriverId = load.driverId ?? parentJob?.driverId ?? null;
    if (assignedDriverId !== matchedDrivers[0]!.id) {
      return clientApiError(
        "TICKET_NOT_ASSIGNED_TO_DRIVER",
        403,
        "This ticket does not belong to a load assigned to this Driver.",
      );
    }

    if (load.status !== "completed" || !load.ticketNumber?.trim()) {
      return clientApiError(
        "TICKET_NOT_READY",
        409,
        "The receiving site has not completed and issued this ticket yet.",
      );
    }

    const signed = createMobileTicketLinkToken({
      loadId: load.id,
      userId: context.userId,
      organisationId: context.organisationId,
    });
    const pdfUrl = new URL(
      `/api/mobile/v1/tickets/${encodeURIComponent(load.id)}/pdf`,
      request.url,
    );
    pdfUrl.searchParams.set("token", signed.token);

    return clientApiJson({
      ok: true,
      ticketNumber: load.ticketNumber,
      pdfUrl: pdfUrl.toString(),
      expiresAt: signed.expiresAt,
    });
  } catch (error) {
    return handleClientApiError(error);
  }
}
