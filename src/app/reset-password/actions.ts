"use server";

import { database } from "@/db/database";
import { passwordResetTokens, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function validateTokenAndResetPassword(
  url: string,
  newPassword: string,
  confirmPassword: string
) {
  if (!url || !newPassword || !confirmPassword) {
    return {
      success: false,
      message: "URL, new password, and confirm password are required.",
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      success: false,
      message: "Password and confirm password do not match.",
    };
  }

  if (newPassword.length < 8) {
    return {
      success: false,
      message: "Password must be at least 8 characters long.",
    };
  }

  // Extract token from the query string
  const urlObject = new URL(url);
  const token = urlObject.searchParams.get("token");

  if (!token) {
    return { success: false, message: "Invalid reset link. Token is missing." };
  }

  // Check token in the database
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
    return { success: false, message: "Invalid or expired token." };
  }

  const email = tokenRecord[0].email;

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    const updatedUser = await database
      .update(users)
      .set({
        password: hashedPassword,
        confirmPassword: hashedPassword,
      })
      .where(eq(users.email, email));

    if (!updatedUser) {
      return {
        success: false,
        message: "Failed to update password. User not found.",
      };
    }

    // Mark the token as used
    await database
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.token, token));

    return {
      success: true,
      message: "Password reset successfully.",
    };
  } catch (error) {
    console.error("Error resetting password:", error);
    return {
      success: false,
      message: "An error occurred while resetting the password.",
    };
  }
}
