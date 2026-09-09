"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, isNull, ne, sql } from "drizzle-orm";

import {
  clientDevices,
  clientSessions,
} from "@/db/client-sync-schema";
import { database } from "@/db/database";
import { drivers, users } from "@/db/schema";
import { generateInviteToken } from "@/modules/auth/services/generateInviteToken";
import { requireSoloPermission } from "@/modules/solo-permissions/core/requireSoloPermission";
import { sendRegEmail } from "@/util/sendRegEmail";

function cleanString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normaliseEmail(value: string) {
  return value.trim().toLowerCase();
}

function mobileError(driverId: string, error: string): never {
  redirect(
    `/home/transport/drivers/${driverId}?error=${encodeURIComponent(error)}`,
  );
}

function mobileSuccess(driverId: string, success: string): never {
  redirect(
    `/home/transport/drivers/${driverId}?success=${encodeURIComponent(success)}`,
  );
}

async function getManagedDriver(driverId: string, organisationId: string) {
  return database.query.drivers.findFirst({
    where: and(
      eq(drivers.id, driverId),
      eq(drivers.organisationId, organisationId),
    ),
  });
}

async function ensureUserNotLinkedElsewhere(
  userId: string,
  driverId: string,
  organisationId: string,
) {
  const otherDriver = await database.query.drivers.findFirst({
    where: and(
      eq(drivers.organisationId, organisationId),
      eq(drivers.linkedUserId, userId),
      ne(drivers.id, driverId),
    ),
    columns: { id: true },
  });

  return !otherDriver;
}

async function issueInvitation({
  driverId,
  driverName,
  userId,
  email,
}: {
  driverId: string;
  driverName: string;
  userId: string;
  email: string;
}) {
  const { rawToken, hashedToken, expiry } = generateInviteToken();
  const now = new Date();

  await database
    .update(users)
    .set({
      inviteToken: hashedToken,
      inviteExpiry: expiry,
      status: "INVITED",
      isActive: false,
      isSuspended: false,
    })
    .where(eq(users.id, userId));

  await database
    .update(drivers)
    .set({
      linkedUserId: userId,
      mobileAccessStatus: "INVITED",
      mobileInvitedAt: now,
      mobileActivatedAt: null,
      mobileSuspendedAt: null,
      mobileRevokedAt: null,
      updatedAt: now,
    })
    .where(eq(drivers.id, driverId));

  const delivery = await sendRegEmail({
    name: driverName,
    email,
    token: rawToken,
  });

  revalidatePath("/home/transport");
  revalidatePath(`/home/transport/drivers/${driverId}`);

  return delivery;
}

export async function inviteDriverToMobileAction(formData: FormData) {
  const context = await requireSoloPermission("team:invite");
  const driverId = cleanString(formData.get("driverId"));

  if (!driverId) redirect("/home/transport?error=missing_driver");

  const driver = await getManagedDriver(driverId, context.organisationId);

  if (!driver) redirect("/home/transport?error=driver_not_found");
  if (!driver.isActive) mobileError(driverId, "mobile_driver_inactive");

  const email = normaliseEmail(driver.email ?? "");

  if (!email) mobileError(driverId, "mobile_email_required");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    mobileError(driverId, "mobile_email_invalid");
  }

  /*
    If the Driver is already explicitly linked, that link is authoritative.
    Never replace it merely because the contact email has changed.
  */
  if (driver.linkedUserId) {
    const linkedUser = await database.query.users.findFirst({
      where: eq(users.id, driver.linkedUserId),
      columns: {
        id: true,
        organisationId: true,
        email: true,
        name: true,
        status: true,
        role: true,
        passwordHash: true,
        isActive: true,
        isSuspended: true,
      },
    });

    if (!linkedUser || linkedUser.organisationId !== context.organisationId) {
      mobileError(driverId, "mobile_link_invalid");
    }

    if (
      linkedUser.status === "ACTIVE" &&
      linkedUser.isActive &&
      !linkedUser.isSuspended
    ) {
      await database
        .update(drivers)
        .set({
          mobileAccessStatus: "ACTIVE",
          mobileActivatedAt: driver.mobileActivatedAt ?? new Date(),
          mobileSuspendedAt: null,
          mobileRevokedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(drivers.id, driver.id));

      revalidatePath(`/home/transport/drivers/${driverId}`);
      mobileSuccess(driverId, "mobile_linked_active");
    }

    /*
      A suspended account with a password represents an established account.
      Mobile invitation must not silently reactivate the whole Waste X user.
    */
    if (
      linkedUser.status === "SUSPENDED" &&
      linkedUser.passwordHash
    ) {
      mobileError(driverId, "mobile_account_suspended");
    }

    const delivery = await issueInvitation({
      driverId: driver.id,
      driverName: driver.name,
      userId: linkedUser.id,
      email: linkedUser.email,
    });

    if (!delivery.success) {
      mobileError(driverId, "mobile_invite_email_failed");
    }

    mobileSuccess(driverId, "mobile_invited");
  }

  /*
    Email is used here only to help the administrator locate an existing
    Waste X account. Once linked, Mobile authorisation uses linkedUserId.
  */
  const existingUser = await database.query.users.findFirst({
    where: sql`lower(trim(${users.email})) = ${email}`,
    columns: {
      id: true,
      organisationId: true,
      email: true,
      name: true,
      status: true,
      role: true,
      passwordHash: true,
      isActive: true,
      isSuspended: true,
    },
  });

  if (existingUser) {
    if (existingUser.organisationId !== context.organisationId) {
      mobileError(driverId, "mobile_account_other_org");
    }

    const available = await ensureUserNotLinkedElsewhere(
      existingUser.id,
      driver.id,
      context.organisationId,
    );

    if (!available) {
      mobileError(driverId, "mobile_account_linked_elsewhere");
    }

    if (
      existingUser.status === "ACTIVE" &&
      existingUser.isActive &&
      !existingUser.isSuspended
    ) {
      await database
        .update(drivers)
        .set({
          linkedUserId: existingUser.id,
          mobileAccessStatus: "ACTIVE",
          mobileActivatedAt: new Date(),
          mobileSuspendedAt: null,
          mobileRevokedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(drivers.id, driver.id));

      revalidatePath("/home/transport");
      revalidatePath(`/home/transport/drivers/${driverId}`);

      mobileSuccess(driverId, "mobile_linked_active");
    }

    if (
      existingUser.status === "SUSPENDED" &&
      existingUser.passwordHash
    ) {
      mobileError(driverId, "mobile_account_suspended");
    }

    const delivery = await issueInvitation({
      driverId: driver.id,
      driverName: driver.name,
      userId: existingUser.id,
      email: existingUser.email,
    });

    if (!delivery.success) {
      mobileError(driverId, "mobile_invite_email_failed");
    }

    mobileSuccess(driverId, "mobile_invited");
  }

  const { rawToken, hashedToken, expiry } = generateInviteToken();
  const now = new Date();

  const [createdUser] = await database
    .insert(users)
    .values({
      name: driver.name,
      email,
      organisationId: context.organisationId,
      departmentId: null,
      role: "driver",
      soloAccessPreset: null,
      status: "INVITED",
      isActive: false,
      isSuspended: false,
      inviteToken: hashedToken,
      inviteExpiry: expiry,
      createdAt: now,
    })
    .returning({
      id: users.id,
      email: users.email,
    });

  if (!createdUser) {
    mobileError(driverId, "mobile_account_create_failed");
  }

  await database
    .update(drivers)
    .set({
      linkedUserId: createdUser.id,
      mobileAccessStatus: "INVITED",
      mobileInvitedAt: now,
      mobileActivatedAt: null,
      mobileSuspendedAt: null,
      mobileRevokedAt: null,
      updatedAt: now,
    })
    .where(eq(drivers.id, driver.id));

  const delivery = await sendRegEmail({
    name: driver.name,
    email: createdUser.email,
    token: rawToken,
  });

  revalidatePath("/home/transport");
  revalidatePath(`/home/transport/drivers/${driverId}`);

  if (!delivery.success) {
    mobileError(driverId, "mobile_invite_email_failed");
  }

  mobileSuccess(driverId, "mobile_invited");
}

export async function resendDriverMobileInviteAction(formData: FormData) {
  const context = await requireSoloPermission("team:invite");
  const driverId = cleanString(formData.get("driverId"));

  if (!driverId) redirect("/home/transport?error=missing_driver");

  const driver = await getManagedDriver(driverId, context.organisationId);

  if (!driver) redirect("/home/transport?error=driver_not_found");

  if (
    driver.mobileAccessStatus !== "INVITED" ||
    !driver.linkedUserId
  ) {
    mobileError(driverId, "mobile_invalid_state");
  }

  const user = await database.query.users.findFirst({
    where: and(
      eq(users.id, driver.linkedUserId),
      eq(users.organisationId, context.organisationId),
    ),
  });

  if (!user || user.status !== "INVITED") {
    mobileError(driverId, "mobile_invalid_state");
  }

  const delivery = await issueInvitation({
    driverId: driver.id,
    driverName: driver.name,
    userId: user.id,
    email: user.email,
  });

  if (!delivery.success) {
    mobileError(driverId, "mobile_invite_email_failed");
  }

  mobileSuccess(driverId, "mobile_invite_resent");
}

export async function cancelDriverMobileInviteAction(formData: FormData) {
  const context = await requireSoloPermission("team:invite");
  const driverId = cleanString(formData.get("driverId"));

  if (!driverId) redirect("/home/transport?error=missing_driver");

  const driver = await getManagedDriver(driverId, context.organisationId);

  if (!driver) redirect("/home/transport?error=driver_not_found");

  if (
    driver.mobileAccessStatus !== "INVITED" ||
    !driver.linkedUserId
  ) {
    mobileError(driverId, "mobile_invalid_state");
  }

  await database
    .update(users)
    .set({
      inviteToken: null,
      inviteExpiry: null,
      status: "SUSPENDED",
      isActive: false,
      isSuspended: true,
    })
    .where(
      and(
        eq(users.id, driver.linkedUserId),
        eq(users.organisationId, context.organisationId),
        eq(users.status, "INVITED"),
      ),
    );

  await database
    .update(drivers)
    .set({
      mobileAccessStatus: "NOT_INVITED",
      updatedAt: new Date(),
    })
    .where(eq(drivers.id, driver.id));

  revalidatePath("/home/transport");
  revalidatePath(`/home/transport/drivers/${driverId}`);

  mobileSuccess(driverId, "mobile_invite_cancelled");
}

export async function suspendDriverMobileAccessAction(formData: FormData) {
  const context = await requireSoloPermission("team:invite");
  const driverId = cleanString(formData.get("driverId"));

  if (!driverId) redirect("/home/transport?error=missing_driver");

  const driver = await getManagedDriver(driverId, context.organisationId);

  if (!driver) redirect("/home/transport?error=driver_not_found");

  if (driver.mobileAccessStatus !== "ACTIVE") {
    mobileError(driverId, "mobile_invalid_state");
  }

  await database
    .update(drivers)
    .set({
      mobileAccessStatus: "SUSPENDED",
      mobileSuspendedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(drivers.id, driver.id));

  revalidatePath(`/home/transport/drivers/${driverId}`);
  mobileSuccess(driverId, "mobile_suspended");
}

export async function restoreDriverMobileAccessAction(formData: FormData) {
  const context = await requireSoloPermission("team:invite");
  const driverId = cleanString(formData.get("driverId"));

  if (!driverId) redirect("/home/transport?error=missing_driver");

  const driver = await getManagedDriver(driverId, context.organisationId);

  if (!driver) redirect("/home/transport?error=driver_not_found");

  if (
    !driver.isActive ||
    !driver.linkedUserId ||
    !["SUSPENDED", "REVOKED"].includes(driver.mobileAccessStatus)
  ) {
    mobileError(driverId, "mobile_invalid_state");
  }

  const user = await database.query.users.findFirst({
    where: and(
      eq(users.id, driver.linkedUserId),
      eq(users.organisationId, context.organisationId),
    ),
    columns: {
      status: true,
      isActive: true,
      isSuspended: true,
    },
  });

  if (
    !user ||
    user.status !== "ACTIVE" ||
    !user.isActive ||
    user.isSuspended
  ) {
    mobileError(driverId, "mobile_account_unavailable");
  }

  await database
    .update(drivers)
    .set({
      mobileAccessStatus: "ACTIVE",
      mobileSuspendedAt: null,
      mobileRevokedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(drivers.id, driver.id));

  revalidatePath(`/home/transport/drivers/${driverId}`);
  mobileSuccess(driverId, "mobile_restored");
}

export async function revokeDriverMobileAccessAction(formData: FormData) {
  const context = await requireSoloPermission("team:invite");
  const driverId = cleanString(formData.get("driverId"));

  if (!driverId) redirect("/home/transport?error=missing_driver");

  const driver = await getManagedDriver(driverId, context.organisationId);

  if (!driver) redirect("/home/transport?error=driver_not_found");

  if (!driver.linkedUserId) {
    mobileError(driverId, "mobile_link_missing");
  }

  await database
    .update(drivers)
    .set({
      mobileAccessStatus: "REVOKED",
      mobileRevokedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(drivers.id, driver.id));

  /*
    Driver-level revocation blocks Mobile authority without deleting the
    Driver, linked user or registered-device history.

    Individual lost/stolen phones are revoked separately below.
  */

  revalidatePath(`/home/transport/drivers/${driverId}`);
  mobileSuccess(driverId, "mobile_revoked");
}

export async function revokeDriverMobileDeviceAction(formData: FormData) {
  const context = await requireSoloPermission("team:invite");
  const driverId = cleanString(formData.get("driverId"));
  const deviceId = cleanString(formData.get("deviceId"));

  if (!driverId) redirect("/home/transport?error=missing_driver");
  if (!deviceId) mobileError(driverId, "mobile_device_missing");

  const driver = await getManagedDriver(
    driverId,
    context.organisationId,
  );

  if (!driver) redirect("/home/transport?error=driver_not_found");

  if (!driver.linkedUserId) {
    mobileError(driverId, "mobile_link_missing");
  }

  const device = await database.query.clientDevices.findFirst({
    where: and(
      eq(clientDevices.id, deviceId),
      eq(clientDevices.organisationId, context.organisationId),
      eq(clientDevices.deviceType, "MOBILE"),
      eq(clientDevices.registeredByUserId, driver.linkedUserId),
    ),
    columns: {
      id: true,
      status: true,
    },
  });

  if (!device) {
    mobileError(driverId, "mobile_device_not_found");
  }

  if (device.status === "REVOKED") {
    mobileSuccess(driverId, "mobile_device_revoked");
  }

  const now = new Date();

  await database
    .update(clientDevices)
    .set({
      status: "REVOKED",
      revokedAt: now,
      updatedAt: now,
    })
    .where(
      and(
        eq(clientDevices.id, device.id),
        eq(clientDevices.organisationId, context.organisationId),
      ),
    );

  /*
    Kill every active Cloud session belonging to this physical phone.
    Historical session rows remain for audit.
  */
  await database
    .update(clientSessions)
    .set({
      revokedAt: now,
    })
    .where(
      and(
        eq(clientSessions.deviceId, device.id),
        eq(clientSessions.organisationId, context.organisationId),
        isNull(clientSessions.revokedAt),
      ),
    );

  revalidatePath(`/home/transport/drivers/${driverId}`);
  mobileSuccess(driverId, "mobile_device_revoked");
}
