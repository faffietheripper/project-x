import {
  and,
  asc,
  desc,
  eq,
} from "drizzle-orm";
import { z } from "zod";

import { clientDevices } from "@/db/client-sync-schema";
import { database } from "@/db/database";
import { sites } from "@/db/schema";
import {
  createClientSession,
  hashOpaqueSecret,
  randomOpaqueSecret,
  verifyWasteXPassword,
} from "@/lib/client-api/auth";
import {
  clientApiError,
  clientApiJson,
  handleClientApiError,
} from "@/lib/client-api/http";
import { uuidV7 } from "@/lib/client-api/ids";

export const dynamic = "force-dynamic";

const provisionSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  displayName: z.string().trim().min(1).max(120),
  platform: z.enum(["WINDOWS", "MACOS", "LINUX"]),
  defaultSiteId: z.string().min(1).nullable().optional(),
});

const allowedRoles = new Set([
  "administrator",
  "operations",
  "seniorManagement",
  "employee",
]);

export async function POST(request: Request) {
  try {
    const parsed = provisionSchema.safeParse(await request.json());

    if (!parsed.success) {
      return clientApiError(
        "INVALID_REQUEST",
        400,
        "Desktop provisioning details are invalid.",
        parsed.error.flatten(),
      );
    }

    const user = await verifyWasteXPassword(
      parsed.data.email,
      parsed.data.password,
    );

    if (!allowedRoles.has(user.role)) {
      return clientApiError(
        "PERMISSION_DENIED",
        403,
        "This Waste X user cannot provision an operational Desktop device.",
      );
    }

    if (!user.organisationId) {
      return clientApiError(
        "ORGANISATION_REQUIRED",
        403,
        "A Waste X organisation is required.",
      );
    }

    const activeSites = await database
      .select({
        id: sites.id,
        name: sites.name,
        isDefault: sites.isDefault,
      })
      .from(sites)
      .where(
        and(
          eq(sites.organisationId, user.organisationId),
          eq(sites.status, "active"),
        ),
      )
      .orderBy(
        desc(sites.isDefault),
        asc(sites.name),
      );

    if (activeSites.length === 0) {
      return clientApiError(
        "SITE_REQUIRED",
        400,
        "This organisation has no active Waste X site available for Desktop.",
      );
    }

    let defaultSiteId = parsed.data.defaultSiteId ?? null;

    if (!defaultSiteId) {
      const explicitDefaults = activeSites.filter(
        (site) => site.isDefault,
      );

      if (explicitDefaults.length === 1) {
        defaultSiteId = explicitDefaults[0]!.id;
      } else if (activeSites.length === 1) {
        defaultSiteId = activeSites[0]!.id;
      }
    }

    if (!defaultSiteId) {
      return clientApiError(
        "SITE_SELECTION_REQUIRED",
        400,
        "Choose the operating site for this Waste X Desktop.",
      );
    }

    if (!activeSites.some((site) => site.id === defaultSiteId)) {
      return clientApiError(
        "INVALID_SITE",
        400,
        "The selected Waste X site is not available to this organisation.",
      );
    }

    const deviceId = uuidV7();
    const deviceSecret = randomOpaqueSecret();
    const now = new Date();

    await database.insert(clientDevices).values({
      id: deviceId,
      organisationId: user.organisationId,
      defaultSiteId,
      displayName: parsed.data.displayName,
      deviceType: "DESKTOP",
      platform: parsed.data.platform,
      status: "ACTIVE",
      secretHash: hashOpaqueSecret(deviceSecret),
      registeredByUserId: user.id,
      lastSeenAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const session = await createClientSession({
      deviceId,
      userId: user.id,
      organisationId: user.organisationId,
    });

    return clientApiJson(
      {
        ok: true,
        device: {
          deviceId,
          organisationId: user.organisationId,
          defaultSiteId,
          displayName: parsed.data.displayName,
          deviceType: "DESKTOP",
          platform: parsed.data.platform,
          status: "ACTIVE",
          registeredAt: now.toISOString(),
        },
        credentials: {
          // Returned once. Desktop must store this in the OS secure store.
          deviceSecret,
          sessionToken: session.sessionToken,
          sessionExpiresAt: session.expiresAt.toISOString(),
        },
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleClientApiError(error);
  }
}
