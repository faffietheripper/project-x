import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";

import { jobCommercialLines } from "@/db/commercial-schema";
import { database } from "@/db/database";
import {
  counterparties,
  counterpartyRoles,
  counterpartySiteAuthorisations,
  counterpartySiteEwcCodes,
  counterpartySites,
  disposalRecoveryCodes,
  drivers,
  ewcCodes,
  jobLoads,
  jobs,
  materialProfiles,
  permitEwcCodes,
  rates,
  sitePermits,
  sites,
  vehicles,
} from "@/db/schema";
import {
  bookingCommercialLines,
  parseIncomingBookingPricing,
  parseOutgoingBookingPricing,
} from "@/modules/commercial/bookingPricing";
import {
  requireClientApiContext,
  requireOperationsRole,
} from "@/lib/client-api/auth";
import { recordSyncChange } from "@/lib/client-api/change-feed";
import {
  clientApiError,
  clientApiJson,
  handleClientApiError,
} from "@/lib/client-api/http";

export const dynamic = "force-dynamic";

const optionalText = z.string().trim().max(4000).nullable().optional();

const createJobSchema = z.object({
  direction: z.enum(["incoming", "outgoing"]),
  jobDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  plannedLoads: z.number().int().min(1).max(100),

  purchaseOrder: optionalText,
  customerReference: optionalText,
  notes: optionalText,

  clientId: z.string().trim().min(1).nullable().optional(),
  clientSiteId: z.string().trim().min(1).nullable().optional(),
  destinationSiteId: z.string().trim().min(1).nullable().optional(),

  transportMode: z.enum(["own", "external"]),
  haulierId: z.string().trim().min(1).nullable().optional(),
  driverId: z.string().trim().min(1).nullable().optional(),
  vehicleId: z.string().trim().min(1).nullable().optional(),

  materialProfileId: z.string().trim().min(1),

  pricing: z.record(z.string(), z.string().max(500)).default({}),
});

function parseJobDate(value: string) {
  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  const parsed = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
}

async function generateJobNumber(
  organisationId: string,
  jobDate: Date,
  direction: "incoming" | "outgoing",
) {
  const datePart = jobDate.toISOString().slice(0, 10).replaceAll("-", "");

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffix = crypto
      .randomUUID()
      .replaceAll("-", "")
      .slice(0, 6)
      .toUpperCase();

    const candidate =
      direction === "outgoing"
        ? `WX-OUT-${datePart}-${suffix}`
        : `WX-${datePart}-${suffix}`;

    const existing = await database.query.jobs.findFirst({
      where: and(
        eq(jobs.organisationId, organisationId),
        eq(jobs.jobNumber, candidate),
      ),
      columns: { id: true },
    });

    if (!existing) return candidate;
  }

  throw new Error("Unable to generate a unique Waste X Job number.");
}

function pricingFormData(values: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

export async function POST(request: Request) {
  try {
    const context = await requireClientApiContext(request);
    requireOperationsRole(context);

    const parsed = createJobSchema.safeParse(await request.json());

    if (!parsed.success) {
      return clientApiError(
        "INVALID_DESKTOP_JOB",
        400,
        "The Desktop Job details are invalid.",
        parsed.error.flatten(),
      );
    }

    if (!context.defaultSiteId) {
      return clientApiError(
        "DESKTOP_SITE_REQUIRED",
        409,
        "This Waste X Desktop must be assigned to a site before it can create Jobs.",
      );
    }

    const input = parsed.data;
    const jobDate = parseJobDate(input.jobDate);

    if (!jobDate) {
      return clientApiError(
        "INVALID_JOB_DATE",
        400,
        "Enter a valid Job date.",
      );
    }

    const ownSite = await database.query.sites.findFirst({
      where: and(
        eq(sites.id, context.defaultSiteId),
        eq(sites.organisationId, context.organisationId),
        eq(sites.status, "active"),
        eq(sites.siteType, "waste_receiving_site"),
      ),
      columns: {
        id: true,
        name: true,
      },
    });

    if (!ownSite) {
      return clientApiError(
        "DESKTOP_SITE_UNAVAILABLE",
        409,
        "The site assigned to this Waste X Desktop is not an active receiving site.",
      );
    }

    const primaryPermit = await database.query.sitePermits.findFirst({
      where: and(
        eq(sitePermits.organisationId, context.organisationId),
        eq(sitePermits.siteId, ownSite.id),
        eq(sitePermits.status, "active"),
        eq(sitePermits.isPrimary, true),
      ),
      columns: {
        id: true,
        permitNumber: true,
      },
    });

    if (!primaryPermit) {
      return clientApiError(
        "SITE_PERMIT_REQUIRED",
        409,
        "This site needs an active primary permit before Desktop can create Jobs.",
      );
    }

    const resolvedHaulierId =
      input.transportMode === "external" ? input.haulierId ?? null : null;
    const resolvedDriverId = input.driverId ?? null;
    const resolvedVehicleId = input.vehicleId ?? null;

    if (input.transportMode === "external" && !resolvedHaulierId) {
      return clientApiError(
        "HAULIER_REQUIRED",
        400,
        "Choose an external haulier.",
      );
    }

    if (resolvedHaulierId) {
      const haulier = await database
        .select({ id: counterparties.id })
        .from(counterparties)
        .innerJoin(
          counterpartyRoles,
          and(
            eq(counterpartyRoles.counterpartyId, counterparties.id),
            eq(counterpartyRoles.organisationId, context.organisationId),
            eq(counterpartyRoles.role, "haulier"),
          ),
        )
        .where(
          and(
            eq(counterparties.id, resolvedHaulierId),
            eq(counterparties.organisationId, context.organisationId),
            eq(counterparties.isActive, true),
          ),
        )
        .limit(1);

      if (!haulier[0]) {
        return clientApiError(
          "INVALID_HAULIER",
          400,
          "That haulier is no longer available.",
        );
      }
    }

    if (resolvedDriverId) {
      const driver = await database.query.drivers.findFirst({
        where: and(
          eq(drivers.id, resolvedDriverId),
          eq(drivers.organisationId, context.organisationId),
          eq(drivers.isActive, true),
        ),
        columns: {
          id: true,
          haulierCounterpartyId: true,
        },
      });

      if (!driver) {
        return clientApiError(
          "INVALID_DRIVER",
          400,
          "That Driver is no longer available.",
        );
      }

      if (driver.haulierCounterpartyId !== resolvedHaulierId) {
        return clientApiError(
          resolvedHaulierId
            ? "DRIVER_NOT_FOR_HAULIER"
            : "DRIVER_NOT_FOR_OWN_TRANSPORT",
          400,
          resolvedHaulierId
            ? "The selected Driver does not belong to that haulier."
            : "The selected Driver is not an own-fleet Driver.",
        );
      }
    }

    if (resolvedVehicleId) {
      const vehicle = await database.query.vehicles.findFirst({
        where: and(
          eq(vehicles.id, resolvedVehicleId),
          eq(vehicles.organisationId, context.organisationId),
          eq(vehicles.isActive, true),
        ),
        columns: {
          id: true,
          haulierCounterpartyId: true,
        },
      });

      if (!vehicle) {
        return clientApiError(
          "INVALID_VEHICLE",
          400,
          "That Vehicle is no longer available.",
        );
      }

      if (vehicle.haulierCounterpartyId !== resolvedHaulierId) {
        return clientApiError(
          resolvedHaulierId
            ? "VEHICLE_NOT_FOR_HAULIER"
            : "VEHICLE_NOT_FOR_OWN_TRANSPORT",
          400,
          resolvedHaulierId
            ? "The selected Vehicle does not belong to that haulier."
            : "The selected Vehicle is not an own-fleet Vehicle.",
        );
      }
    }

    const materialRows = await database
      .select({
        id: materialProfiles.id,
        ewcCodeId: materialProfiles.ewcCodeId,
        ewcCode: ewcCodes.code,
        wasteDescription: materialProfiles.wasteDescription,
        physicalForm: materialProfiles.physicalForm,
        defaultNumberOfContainers:
          materialProfiles.defaultNumberOfContainers,
        defaultContainerType: materialProfiles.defaultContainerType,
        containsPops: materialProfiles.containsPops,
        popsSourceOfComponents: materialProfiles.popsSourceOfComponents,
        popsComponents: materialProfiles.popsComponents,
        containsHazardous: materialProfiles.containsHazardous,
        hazardousSourceOfComponents:
          materialProfiles.hazardousSourceOfComponents,
        hazardousHazCodes: materialProfiles.hazardousHazCodes,
        hazardousComponents: materialProfiles.hazardousComponents,
        defaultDisposalRecoveryCodeId:
          materialProfiles.defaultDisposalRecoveryCodeId,
        defaultWeightMetric: materialProfiles.defaultWeightMetric,
        disposalRecoveryCode: disposalRecoveryCodes.code,
      })
      .from(materialProfiles)
      .innerJoin(ewcCodes, eq(materialProfiles.ewcCodeId, ewcCodes.id))
      .leftJoin(
        disposalRecoveryCodes,
        eq(
          materialProfiles.defaultDisposalRecoveryCodeId,
          disposalRecoveryCodes.id,
        ),
      )
      .where(
        and(
          eq(materialProfiles.id, input.materialProfileId),
          eq(materialProfiles.organisationId, context.organisationId),
          eq(materialProfiles.isActive, true),
          eq(ewcCodes.isActive, true),
        ),
      )
      .limit(1);

    const material = materialRows[0];

    if (!material) {
      return clientApiError(
        "INVALID_MATERIAL",
        400,
        "That Material / waste profile is no longer available.",
      );
    }

    const ownPermitMatch = await database
      .select({ ewcCodeId: permitEwcCodes.ewcCodeId })
      .from(permitEwcCodes)
      .where(
        and(
          eq(permitEwcCodes.organisationId, context.organisationId),
          eq(permitEwcCodes.permitId, primaryPermit.id),
          eq(permitEwcCodes.ewcCodeId, material.ewcCodeId),
          eq(permitEwcCodes.isActive, true),
        ),
      )
      .limit(1);

    if (!ownPermitMatch[0]) {
      return clientApiError(
        "MATERIAL_NOT_PERMITTED_AT_SITE",
        400,
        `${material.ewcCode} is not configured on this site's active primary permit.`,
      );
    }

    let clientId: string | null = null;
    let clientSiteId: string | null = null;
    let destinationSiteId: string | null = null;

    if (input.direction === "incoming") {
      clientId = input.clientId ?? null;
      clientSiteId = input.clientSiteId ?? null;

      if (!clientId) {
        return clientApiError(
          "CLIENT_REQUIRED",
          400,
          "Choose the source company / client for this incoming Job.",
        );
      }

      if (!clientSiteId) {
        return clientApiError(
          "CLIENT_SITE_REQUIRED",
          400,
          "Choose the source site / project for this incoming Job.",
        );
      }

      const client = await database
        .select({ id: counterparties.id })
        .from(counterparties)
        .innerJoin(
          counterpartyRoles,
          and(
            eq(counterpartyRoles.counterpartyId, counterparties.id),
            eq(counterpartyRoles.organisationId, context.organisationId),
            eq(counterpartyRoles.role, "client"),
          ),
        )
        .where(
          and(
            eq(counterparties.id, clientId),
            eq(counterparties.organisationId, context.organisationId),
            eq(counterparties.isActive, true),
          ),
        )
        .limit(1);

      if (!client[0]) {
        return clientApiError(
          "INVALID_CLIENT",
          400,
          "That source company / client is no longer available.",
        );
      }

      const clientSite = await database.query.counterpartySites.findFirst({
        where: and(
          eq(counterpartySites.id, clientSiteId),
          eq(counterpartySites.organisationId, context.organisationId),
          eq(counterpartySites.counterpartyId, clientId),
          eq(counterpartySites.isActive, true),
        ),
        columns: { id: true },
      });

      if (!clientSite) {
        return clientApiError(
          "INVALID_CLIENT_SITE",
          400,
          "That source site does not belong to the selected company.",
        );
      }
    } else {
      destinationSiteId = input.destinationSiteId ?? null;

      if (!destinationSiteId) {
        return clientApiError(
          "DESTINATION_REQUIRED",
          400,
          "Choose the third-party destination facility.",
        );
      }

      const destination = await database.query.counterpartySites.findFirst({
        where: and(
          eq(counterpartySites.id, destinationSiteId),
          eq(counterpartySites.organisationId, context.organisationId),
          eq(counterpartySites.siteType, "third_party_tip"),
          eq(counterpartySites.isActive, true),
        ),
        columns: { id: true },
      });

      if (!destination) {
        return clientApiError(
          "INVALID_DESTINATION",
          400,
          "That third-party destination is no longer available.",
        );
      }

      const facilityPermitMatch = await database
        .select({ authorisationId: counterpartySiteAuthorisations.id })
        .from(counterpartySiteAuthorisations)
        .innerJoin(
          counterpartySiteEwcCodes,
          eq(
            counterpartySiteEwcCodes.authorisationId,
            counterpartySiteAuthorisations.id,
          ),
        )
        .where(
          and(
            eq(
              counterpartySiteAuthorisations.organisationId,
              context.organisationId,
            ),
            eq(
              counterpartySiteAuthorisations.counterpartySiteId,
              destinationSiteId,
            ),
            eq(counterpartySiteAuthorisations.status, "active"),
            eq(
              counterpartySiteEwcCodes.organisationId,
              context.organisationId,
            ),
            eq(counterpartySiteEwcCodes.ewcCodeId, material.ewcCodeId),
            eq(counterpartySiteEwcCodes.isActive, true),
          ),
        )
        .limit(1);

      if (!facilityPermitMatch[0]) {
        return clientApiError(
          "DESTINATION_NOT_PERMITTED_FOR_MATERIAL",
          400,
          `${material.ewcCode} is not configured on the selected facility's active authorisation.`,
        );
      }
    }

    const pricingInput = pricingFormData(input.pricing);
    const pricingResult =
      input.direction === "incoming"
        ? parseIncomingBookingPricing(pricingInput)
        : parseOutgoingBookingPricing(pricingInput);

    if (!pricingResult.ok) {
      return clientApiError(
        "INVALID_JOB_PRICING",
        400,
        `The Job-specific pricing is invalid: ${pricingResult.error}`,
      );
    }

    const pricing = pricingResult.data;

    const sourceRate =
      pricing.sourceRateId
        ? await database.query.rates.findFirst({
            where: and(
              eq(rates.id, pricing.sourceRateId),
              eq(rates.organisationId, context.organisationId),
              eq(rates.isActive, true),
            ),
            columns: { id: true },
          })
        : null;

    const jobId = crypto.randomUUID();
    const jobNumber = await generateJobNumber(
      context.organisationId,
      jobDate,
      input.direction,
    );
    const now = new Date();

    await database.transaction(async (tx) => {
      await tx.insert(jobs).values({
        id: jobId,
        organisationId: context.organisationId,
        jobNumber,
        source: "manual",
        direction: input.direction,
        status: "booked",
        jobDate,

        clientCounterpartyId: clientId,
        clientSiteId,
        ownSiteId: ownSite.id,
        sitePermitId: primaryPermit.id,
        thirdPartyDestinationSiteId: destinationSiteId,

        haulierCounterpartyId: resolvedHaulierId,
        driverId: resolvedDriverId,
        vehicleId: resolvedVehicleId,
        materialProfileId: input.materialProfileId,

        plannedLoads: input.plannedLoads,
        purchaseOrder: input.purchaseOrder ?? null,
        customerReference: input.customerReference ?? null,
        rateId: sourceRate?.id ?? null,
        notes: input.notes ?? null,

        createdByUserId: context.userId,
        createdAt: now,
        updatedAt: now,
      });

      await tx.insert(jobLoads).values(
        Array.from({ length: input.plannedLoads }, (_, index) => ({
          id: crypto.randomUUID(),
          organisationId: context.organisationId,
          jobId,
          loadNumber: index + 1,
          status: "planned" as const,
          direction: input.direction,

          clientCounterpartyId: clientId,
          clientSiteId,
          ownSiteId: ownSite.id,
          sitePermitId: primaryPermit.id,
          thirdPartyDestinationSiteId: destinationSiteId,

          haulierCounterpartyId: resolvedHaulierId,
          driverId: resolvedDriverId,
          vehicleId: resolvedVehicleId,
          materialProfileId: input.materialProfileId,

          ewcCodeId: material.ewcCodeId,
          ewcCodeSnapshot: material.ewcCode,
          wasteDescriptionSnapshot: material.wasteDescription,
          physicalFormSnapshot: material.physicalForm,
          numberOfContainers: material.defaultNumberOfContainers,
          containerTypeSnapshot: material.defaultContainerType,

          containsPops: material.containsPops,
          popsSourceOfComponents: material.popsSourceOfComponents,
          popsComponents: material.popsComponents,

          containsHazardous: material.containsHazardous,
          hazardousSourceOfComponents:
            material.hazardousSourceOfComponents,
          hazardousHazCodes: material.hazardousHazCodes,
          hazardousComponents: material.hazardousComponents,

          disposalRecoveryCodeId:
            material.defaultDisposalRecoveryCodeId,
          disposalRecoveryCodeSnapshot: material.disposalRecoveryCode,

          weightMetric: material.defaultWeightMetric,
          weightIsEstimate: false,
          weightSource: "manual" as const,

          purchaseOrder: input.purchaseOrder ?? null,
          customerReference: input.customerReference ?? null,

          customerChargeAmount:
            pricing.primaryRevenue?.amount ?? null,
          customerChargeUnit:
            pricing.primaryRevenue?.unit ?? null,
          haulageCostAmount: pricing.haulageCost?.amount ?? null,
          haulageCostUnit: pricing.haulageCost?.unit ?? null,
          tippingCostAmount: pricing.tippingCost?.amount ?? null,
          tippingCostUnit: pricing.tippingCost?.unit ?? null,
          currency: "GBP",

          createdByUserId: context.userId,
          createdAt: now,
          updatedAt: now,
        })),
      );

      const commercialLines = bookingCommercialLines(pricing);

      if (commercialLines.length > 0) {
        await tx.insert(jobCommercialLines).values(
          commercialLines.map((line) => ({
            organisationId: context.organisationId,
            jobId,
            kind: line.kind,
            category: line.category,
            description: line.description,
            amount: line.amount,
            unit: line.unit,
            currency: "GBP",
            vatRate: line.vatRate,
            sortOrder: line.sortOrder,
            isActive: true,
            createdByUserId: context.userId,
            createdAt: now,
            updatedAt: now,
          })),
        );
      }
    });

    const createdJob = await database.query.jobs.findFirst({
      where: and(
        eq(jobs.id, jobId),
        eq(jobs.organisationId, context.organisationId),
      ),
    });

    const createdLoads = await database
      .select()
      .from(jobLoads)
      .where(
        and(
          eq(jobLoads.jobId, jobId),
          eq(jobLoads.organisationId, context.organisationId),
        ),
      )
      .orderBy(asc(jobLoads.loadNumber));

    if (!createdJob || createdLoads.length !== input.plannedLoads) {
      throw new Error(
        "Waste X created the Job but could not verify its planned Load rows.",
      );
    }

    /*
      Job creation is Cloud-authoritative. Publish normal change-feed rows for
      connected clients. A change-feed problem must not roll back a Job that
      was already committed successfully; Desktop refreshes bootstrap next.
    */
    let syncFeedWarning = false;

    try {
      await recordSyncChange({
        organisationId: context.organisationId,
        siteId: ownSite.id,
        entityType: "job",
        entityId: createdJob.id,
        payload: createdJob,
      });

      for (const load of createdLoads) {
        await recordSyncChange({
          organisationId: context.organisationId,
          siteId: ownSite.id,
          entityType: "job_load",
          entityId: load.id,
          payload: load,
        });
      }
    } catch (error) {
      syncFeedWarning = true;

      console.error(
        "[DESKTOP_JOB_CREATE] Job saved but change-feed publication failed",
        {
          jobId,
          error,
        },
      );
    }

    return clientApiJson(
      {
        ok: true,
        job: createdJob,
        jobLoads: createdLoads,
        firstLoadId: createdLoads[0]?.id ?? null,
        syncFeedWarning,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleClientApiError(error);
  }
}
