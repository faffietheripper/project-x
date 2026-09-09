import Link from "next/link";
/* WASTE_X_OWN_CARRIER_DRIVER_DWT_V1 */
import { notFound, redirect } from "next/navigation";
import { and, asc, desc, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { clientDevices } from "@/db/client-sync-schema";
import { database } from "@/db/database";
import {
  counterparties,
  counterpartyRoles,
  drivers,
  users,
  vehicles,
} from "@/db/schema";
import OwnCarrierDwtFields from "@/modules/digital-waste-tracking/components/OwnCarrierDwtFields";
import {
  canManageOwnCarrierDwtSettings,
} from "@/modules/digital-waste-tracking/data-access/saveOwnCarrierDwtSettings";
import { getWasteTrackingOrganisationSettings } from "@/modules/digital-waste-tracking/data-access/getWasteTrackingOrganisationSettings";
import {
  archiveDriverAction,
  restoreDriverAction,
  updateDriverAction,
} from "../../actions";
import {
  cancelDriverMobileInviteAction,
  inviteDriverToMobileAction,
  resendDriverMobileInviteAction,
  restoreDriverMobileAccessAction,
  revokeDriverMobileAccessAction,
  revokeDriverMobileDeviceAction,
  suspendDriverMobileAccessAction,
} from "../../mobile-access-actions";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function message(key: string, type: "success" | "error") {
  const success: Record<string, string> = {
    created: "Driver created.",
    updated: "Driver updated.",
    archived: "Driver archived.",
    restored: "Driver restored.",
    mobile_invited: "Waste X Mobile invitation sent.",
    mobile_invite_resent: "Waste X Mobile invitation resent.",
    mobile_invite_cancelled: "Mobile invitation cancelled.",
    mobile_linked_active: "Existing Waste X account linked. Mobile access is active.",
    mobile_suspended: "Waste X Mobile access suspended.",
    mobile_restored: "Waste X Mobile access restored.",
    mobile_revoked: "Waste X Mobile access revoked.",
    mobile_device_revoked: "Mobile device revoked. That installation can no longer access Waste X.",
  };

  const errors: Record<string, string> = {
    name_required: "Enter the driver's name.",
    invalid_haulier: "Choose a valid active haulier.",
    invalid_vehicle: "Choose a valid active vehicle.",
    vehicle_haulier_mismatch: "The default vehicle belongs to a different haulier.",
    own_carrier_invalid_reason: "Choose a valid reason for having no carrier registration.",
    own_carrier_invalid_means: "Choose a valid means of transport.",
    mobile_email_required: "Add an email address to this Driver before inviting them to Waste X Mobile.",
    mobile_email_invalid: "Enter a valid Driver email address before sending a Mobile invitation.",
    mobile_driver_inactive: "Restore this Driver before enabling Waste X Mobile.",
    mobile_account_other_org: "That Waste X account belongs to another organisation.",
    mobile_account_linked_elsewhere: "That Waste X account is already linked to another Driver.",
    mobile_account_suspended: "That Waste X account is suspended and cannot be reactivated through Mobile Access.",
    mobile_account_unavailable: "The linked Waste X account is not currently available.",
    mobile_account_create_failed: "Waste X could not create the Driver account.",
    mobile_invite_email_failed: "The Mobile account was prepared, but the invitation email could not be delivered. You can resend it below.",
    mobile_invalid_state: "That Mobile Access action is not available in the Driver's current state.",
    mobile_link_invalid: "The linked Waste X account is invalid for this organisation.",
    mobile_link_missing: "This Driver does not have a linked Waste X account.",
    mobile_device_missing: "Choose a Mobile device to revoke.",
    mobile_device_not_found: "That Mobile device is not registered to this Driver.",
  };

  return type === "success" ? success[key] ?? "Changes saved." : errors[key] ?? "Something went wrong.";
}

export default async function DriverDetailPage({
  params,
  searchParams,
}: {
  params: { driverId: string };
  searchParams: { success?: string | string[]; error?: string | string[] };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const currentUser = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { organisationId: true, role: true },
  });
  if (!currentUser?.organisationId) redirect("/home");

  const organisationId = currentUser.organisationId;
  const driver = await database.query.drivers.findFirst({
    where: and(eq(drivers.id, params.driverId), eq(drivers.organisationId, organisationId)),
  });
  if (!driver) notFound();

  const linkedMobileUser = driver.linkedUserId
    ? await database.query.users.findFirst({
        where: and(
          eq(users.id, driver.linkedUserId),
          eq(users.organisationId, organisationId),
        ),
        columns: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          isActive: true,
          isSuspended: true,
          inviteExpiry: true,
          lastLoginAt: true,
        },
      })
    : null;

  const mobileDevices = linkedMobileUser
    ? await database
        .select({
          id: clientDevices.id,
          displayName: clientDevices.displayName,
          platform: clientDevices.platform,
          status: clientDevices.status,
          lastSeenAt: clientDevices.lastSeenAt,
          revokedAt: clientDevices.revokedAt,
          createdAt: clientDevices.createdAt,
        })
        .from(clientDevices)
        .where(
          and(
            eq(clientDevices.organisationId, organisationId),
            eq(clientDevices.deviceType, "MOBILE"),
            eq(clientDevices.registeredByUserId, linkedMobileUser.id),
          ),
        )
        .orderBy(desc(clientDevices.createdAt))
    : [];

  const dwtSettings = await getWasteTrackingOrganisationSettings({
    organisationId,
  });
  const canEditOwnCarrierDwt = canManageOwnCarrierDwtSettings(
    currentUser.role,
  );

  const [hauliers, vehicleRows] = await Promise.all([
    database
      .select({ id: counterparties.id, name: counterparties.name })
      .from(counterparties)
      .innerJoin(
        counterpartyRoles,
        and(
          eq(counterpartyRoles.counterpartyId, counterparties.id),
          eq(counterpartyRoles.role, "haulier"),
        ),
      )
      .where(
        and(
          eq(counterparties.organisationId, organisationId),
          eq(counterparties.isActive, true),
        ),
      )
      .orderBy(asc(counterparties.name)),
    database
      .select()
      .from(vehicles)
      .where(
        and(
          eq(vehicles.organisationId, organisationId),
          eq(vehicles.isActive, true),
        ),
      )
      .orderBy(asc(vehicles.registrationNumber)),
  ]);

  const haulierName = new Map(hauliers.map((item) => [item.id, item.name]));
  const currentHaulierName = driver.haulierCounterpartyId ? haulierName.get(driver.haulierCounterpartyId) ?? "Archived / unavailable haulier" : "Own / unassigned";
  const currentVehicle = driver.defaultVehicleId ? vehicleRows.find((item) => item.id === driver.defaultVehicleId) : null;

  const success = firstParam(searchParams.success);
  const error = firstParam(searchParams.error);

  return (
    <main className="min-h-screen bg-[#f7f3ed] px-8 py-32 pl-[24vw]">
      <div className="mx-auto max-w-5xl space-y-7">
        <section className="rounded-[2rem] bg-black p-8 text-white">
          <Link href="/home/transport?view=drivers" className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">← Drivers & Vehicles</Link>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-semibold">{driver.name}</h1>
            {!driver.isActive && <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase text-white/60">Archived</span>}
          </div>
          <p className="mt-3 text-sm text-white/50">{currentHaulierName}</p>
        </section>

        {success && <Notice type="success">{message(success, "success")}</Notice>}
        {error && <Notice type="error">{message(error, "error")}</Notice>}

        <section className="grid gap-4 md:grid-cols-3">
          <Stat label="Haulier" value={currentHaulierName} />
          <Stat label="Telephone" value={driver.telephone ?? "Not set"} />
          <Stat label="Default vehicle" value={currentVehicle?.registrationNumber ?? "Not set"} />
        </section>

        <section className="rounded-[2rem] border border-black/10 bg-white p-7 shadow-sm">
          <h2 className="text-xl font-semibold">Driver Details</h2>
          <form action={updateDriverAction} className="mt-6 grid gap-5 md:grid-cols-2">
            <input type="hidden" name="driverId" value={driver.id} />
            <Field label="Driver name" name="name" defaultValue={driver.name} required />
            <Select label="Haulier" name="haulierCounterpartyId" defaultValue={driver.haulierCounterpartyId ?? ""}>
              <option value="">Own / unassigned</option>
              {hauliers.map((haulier) => <option key={haulier.id} value={haulier.id}>{haulier.name}</option>)}
            </Select>
            <Field label="Telephone" name="telephone" defaultValue={driver.telephone ?? ""} />
            <Field label="Email" name="email" type="email" defaultValue={driver.email ?? ""} />
            <Select label="Default vehicle" name="defaultVehicleId" defaultValue={driver.defaultVehicleId ?? ""}>
              <option value="">No default vehicle</option>
              {vehicleRows.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.registrationNumber} · {vehicle.haulierCounterpartyId ? haulierName.get(vehicle.haulierCounterpartyId) ?? "Haulier" : "Own / unassigned"}
                </option>
              ))}
            </Select>
            <Field label="Internal notes" name="notes" defaultValue={driver.notes ?? ""} />

            <div className="md:col-span-2 rounded-3xl border border-black/10 bg-[#faf8f4] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-700">
                Own Carrier DWT
              </p>
              <h3 className="mt-2 text-lg font-semibold text-black">
                Organisation carrier identity
              </h3>
              <p className="mt-2 mb-5 text-sm leading-6 text-black/50">
                These values apply only when the driver is saved as
                <span className="font-semibold text-black"> Own / unassigned</span>.
                If the driver belongs to an external haulier, Waste X uses that
                haulier&apos;s carrier registration instead.
              </p>
              <OwnCarrierDwtFields
                canEdit={canEditOwnCarrierDwt && driver.isActive}
                initial={{
                  registrationNumber:
                    dwtSettings?.ownCarrierRegistrationNumber ?? "",
                  reasonForNoRegistrationNumber:
                    dwtSettings?.ownCarrierReasonForNoRegistrationNumber ?? "",
                  meansOfTransport:
                    dwtSettings?.ownCarrierMeansOfTransport ?? "Road",
                }}
              />
            </div>

            {driver.isActive && (
              <div className="md:col-span-2">
                <button type="submit" className="rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-orange-400">Save Driver</button>
              </div>
            )}
          </form>
        </section>


        <section className="rounded-[2rem] border border-black/10 bg-white p-7 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-700">
                Mobile Access
              </p>
              <h2 className="mt-2 text-xl font-semibold">Waste X Mobile</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
                Mobile access is granted explicitly to this Driver. The Driver
                contact email is not used as Mobile authorisation once an
                account has been linked.
              </p>
            </div>

            <span className="rounded-full border border-black/10 bg-[#faf8f4] px-4 py-2 text-xs font-semibold">
              {mobileAccessLabel(driver.mobileAccessStatus)}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Stat
              label="Linked account"
              value={linkedMobileUser?.email ?? "Not linked"}
            />
            <Stat
              label="Account status"
              value={linkedMobileUser?.status ?? "—"}
            />
            <Stat
              label="Device records"
              value={String(mobileDevices.length)}
            />
          </div>

          {driver.mobileAccessStatus === "INVITED" && (
            <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm text-orange-900">
              Invitation awaiting activation
              {linkedMobileUser?.inviteExpiry
                ? ` · expires ${formatMobileDate(linkedMobileUser.inviteExpiry)}`
                : ""}
            </div>
          )}

          {!driver.email && driver.mobileAccessStatus === "NOT_INVITED" && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
              Add an email address in Driver Details before inviting this Driver
              to Waste X Mobile.
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {driver.mobileAccessStatus === "NOT_INVITED" && (
              <form action={inviteDriverToMobileAction}>
                <input type="hidden" name="driverId" value={driver.id} />
                <button
                  disabled={!driver.isActive || !driver.email}
                  className="rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Invite to Waste X Mobile
                </button>
              </form>
            )}

            {driver.mobileAccessStatus === "INVITED" && (
              <>
                <form action={resendDriverMobileInviteAction}>
                  <input type="hidden" name="driverId" value={driver.id} />
                  <button className="rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-orange-400">
                    Resend invitation
                  </button>
                </form>

                <form action={cancelDriverMobileInviteAction}>
                  <input type="hidden" name="driverId" value={driver.id} />
                  <button className="rounded-2xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold">
                    Cancel invitation
                  </button>
                </form>
              </>
            )}

            {driver.mobileAccessStatus === "ACTIVE" && (
              <>
                <form action={suspendDriverMobileAccessAction}>
                  <input type="hidden" name="driverId" value={driver.id} />
                  <button className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-3 text-sm font-semibold text-amber-800">
                    Suspend Mobile Access
                  </button>
                </form>

                <form action={revokeDriverMobileAccessAction}>
                  <input type="hidden" name="driverId" value={driver.id} />
                  <button className="rounded-2xl border border-red-200 bg-red-50 px-6 py-3 text-sm font-semibold text-red-700">
                    Revoke Mobile Access
                  </button>
                </form>
              </>
            )}

            {(driver.mobileAccessStatus === "SUSPENDED" ||
              driver.mobileAccessStatus === "REVOKED") && (
              <form action={restoreDriverMobileAccessAction}>
                <input type="hidden" name="driverId" value={driver.id} />
                <button className="rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-orange-400">
                  Restore Mobile Access
                </button>
              </form>
            )}
          </div>

          <div className="mt-8 border-t border-black/10 pt-6">
            <div>
              <h3 className="text-sm font-semibold">Registered phones</h3>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-black/45">
                Revoke an individual phone if it is lost, stolen or no longer
                trusted. Other registered phones remain unaffected.
              </p>
            </div>

            {mobileDevices.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-black/10 bg-[#faf8f4] px-5 py-4 text-sm text-black/45">
                No Mobile devices have been registered for this Driver yet.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {mobileDevices.map((device) => (
                  <div
                    key={device.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/10 bg-[#faf8f4] px-5 py-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">
                          {device.displayName}
                        </p>
                        <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide">
                          {device.status}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-black/45">
                        {device.platform}
                        {" · "}
                        Last seen {formatMobileDate(device.lastSeenAt)}
                      </p>

                      <p className="mt-1 text-[11px] text-black/35">
                        Registered {formatMobileDate(device.createdAt)}
                        {device.revokedAt
                          ? ` · revoked ${formatMobileDate(device.revokedAt)}`
                          : ""}
                      </p>
                    </div>

                    {device.status !== "REVOKED" && (
                      <form action={revokeDriverMobileDeviceAction}>
                        <input
                          type="hidden"
                          name="driverId"
                          value={driver.id}
                        />
                        <input
                          type="hidden"
                          name="deviceId"
                          value={device.id}
                        />
                        <button className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700">
                          Revoke this device
                        </button>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {driver.mobileAccessStatus === "REVOKED" && (
            <p className="mt-5 text-xs leading-5 text-black/40">
              Driver-level Mobile access is revoked. The Driver, linked account
              and device records remain preserved for audit history.
            </p>
          )}
        </section>

        <section className="flex gap-3 rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
          {driver.isActive ? (
            <form action={archiveDriverAction}>
              <input type="hidden" name="driverId" value={driver.id} />
              <button className="rounded-2xl border border-red-200 bg-red-50 px-6 py-3 text-sm font-semibold text-red-700">Archive Driver</button>
            </form>
          ) : (
            <form action={restoreDriverAction}>
              <input type="hidden" name="driverId" value={driver.id} />
              <button className="rounded-2xl border border-green-200 bg-green-50 px-6 py-3 text-sm font-semibold text-green-700">Restore Driver</button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}


function mobileAccessLabel(
  status: "NOT_INVITED" | "INVITED" | "ACTIVE" | "SUSPENDED" | "REVOKED",
) {
  switch (status) {
    case "NOT_INVITED":
      return "Not invited";
    case "INVITED":
      return "Invitation sent";
    case "ACTIVE":
      return "Active";
    case "SUSPENDED":
      return "Suspended";
    case "REVOKED":
      return "Revoked";
  }
}

function formatMobileDate(value: Date | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

const inputClass = "h-12 w-full rounded-2xl border border-black/10 bg-[#faf8f4] px-4 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

function Field({ label, name, defaultValue, type = "text", required = false }: { label: string; name: string; defaultValue?: string; type?: string; required?: boolean }) {
  return <label><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-black/40">{label}</span><input name={name} type={type} defaultValue={defaultValue} required={required} className={inputClass} /></label>;
}

function Select({ label, name, defaultValue, children }: { label: string; name: string; defaultValue: string; children: React.ReactNode }) {
  return <label><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-black/40">{label}</span><select name={name} defaultValue={defaultValue} className={inputClass}>{children}</select></label>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <article className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/35">{label}</p><p className="mt-3 truncate text-sm font-semibold text-black/70">{value}</p></article>;
}

function Notice({ type, children }: { type: "success" | "error"; children: React.ReactNode }) {
  return <div className={type === "success" ? "rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-800" : "rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-800"}>{children}</div>;
}
