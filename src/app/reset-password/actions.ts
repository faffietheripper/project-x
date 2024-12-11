"use server";

import { database } from "@/db/database";
import { passwordResetTokens, users } from "@/db/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

export async function submitResetPassword(token: string, newPassword: string) {
  // Validate inputs
  if (!token || !newPassword) {
    return { message: "Token and password are required", success: false };
  }

  // Fetch the token record from the database
  const tokenRecord = await database
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token))
    .limit(1);

  if (
    !tokenRecord.length ||
    tokenRecord[0].expires < new Date() ||
    tokenRecord[0].used
  ) {
    return { message: "Invalid or expired token", success: false };
  }

  const userId = tokenRecord[0].userId;

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await database
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));

    // Mark the token as used
    await database
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.token, token));

    return { message: "Password successfully reset", success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    return {
      message: "An error occurred while resetting the password",
      success: false,
    };
  }
}
