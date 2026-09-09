import {
  and,
  asc,
  desc,
  eq,
} from "drizzle-orm";
import { z } from "zod";

import { database } from "@/db/database";
import {
  organisations,
  sites,
} from "@/db/schema";
import { verifyWasteXPassword } from "@/lib/client-api/auth";
import {
  clientApiError,
  clientApiJson,
  handleClientApiError,
} from "@/lib/client-api/http";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const allowedRoles = new Set([
  "administrator",
  "operations",
  "seniorManagement",
  "employee",
]);

export async function POST(request: Request) {
  try {
    const parsed = requestSchema.safeParse(await request.json());

    if (!parsed.success) {
      return clientApiError(
        "INVALID_REQUEST",
        400,
        "Waste X sign-in details are invalid.",
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

    const [organisation] = await database
      .select({
        id: organisations.id,
        name: organisations.teamName,
      })
      .from(organisations)
      .where(eq(organisations.id, user.organisationId))
      .limit(1);

    if (!organisation) {
      return clientApiError(
        "ORGANISATION_UNAVAILABLE",
        404,
        "The Waste X organisation could not be found.",
      );
    }

    const activeSites = await database
      .select({
        id: sites.id,
        name: sites.name,
        fullAddress: sites.fullAddress,
        postcode: sites.postcode,
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

    const explicitDefaults = activeSites.filter(
      (site) => site.isDefault,
    );

    const recommendedSiteId =
      explicitDefaults.length === 1
        ? explicitDefaults[0]!.id
        : activeSites.length === 1
          ? activeSites[0]!.id
          : null;

    return clientApiJson({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      organisation,
      sites: activeSites,
      recommendedSiteId,
    });
  } catch (error) {
    return handleClientApiError(error);
  }
}
