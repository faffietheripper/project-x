"use server";

import { database } from "@/db/database";
import { drivers, users } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";
import crypto from "crypto";
import bcryptjs from "bcryptjs";

import { withErrorHandling } from "@/lib/errors/withErrorHandling";
import { ERROR_CODES } from "@/lib/errors/errorCodes";

/* =========================================================
   TYPES
========================================================= */

type ActionResponse =
  | { success: true; accountType: "mobile" | "web" }
  | { success: false; message: string };

/* =========================================================
   COMPLETE INVITE
========================================================= */

export const completeInvite = withErrorHandling(
  async ({
    token,
    password,
  }: {
    token: string;
    password: string;
  }): Promise<ActionResponse> => {
    /* ===============================
       VALIDATION (UX SAFE)
    ============================== */

    if (!token) {
      return { success: false, message: "Invalid invite link." };
    }

    if (!password || password.length < 8) {
      return {
        success: false,
        message: "Password must be at least 8 characters.",
      };
    }

    /* ===============================
       HASH TOKEN (SECURE MATCH)
    ============================== */

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    /* ===============================
       FIND USER
    ============================== */

    /*
      New Waste X invitations store SHA-256(token).
      Raw-token lookup remains temporarily for invitations created by the
      legacy team invitation flow before token storage was standardised.
    */
    const user = await database.query.users.findFirst({
      where: or(
        eq(users.inviteToken, hashedToken),
        eq(users.inviteToken, token),
      ),
    });

    if (!user) {
      return { success: false, message: "Invalid invite link." };
    }

    /* ===============================
       EXPIRY CHECK
    ============================== */

    if (!user.inviteExpiry || user.inviteExpiry < new Date()) {
      return {
        success: false,
        message: "Invite link has expired.",
      };
    }

    /* ===============================
       HASH PASSWORD
    ============================== */

    const passwordHash = await bcryptjs.hash(password, 10);

    /* ===============================
       ACTIVATE USER
    ============================== */

    await database
      .update(users)
      .set({
        passwordHash,
        inviteToken: null,
        inviteExpiry: null,
        status: "ACTIVE",
        isActive: true,
        isSuspended: false,
      })
      .where(eq(users.id, user.id));

    /*
      If this Waste X account was invited through a Driver Mobile Access
      record, completing account setup also activates Mobile access.
    */
    await database
      .update(drivers)
      .set({
        mobileAccessStatus: "ACTIVE",
        mobileActivatedAt: new Date(),
        mobileSuspendedAt: null,
        mobileRevokedAt: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(drivers.linkedUserId, user.id),
          eq(drivers.mobileAccessStatus, "INVITED"),
        ),
      );

    return {
      success: true,
      accountType: user.role === "driver" ? "mobile" : "web",
    };
  },
  {
    actionName: "completeInvite",
    code: ERROR_CODES.AUTH_INVALID_TOKEN,
    severity: "high", // onboarding + auth critical
  },
);
