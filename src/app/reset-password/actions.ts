"use server";

import { database } from "@/db/database";
import { passwordResetTokens, users } from "@/db/schema";
import bcrypt from "bcrypt";

export async function submitResetPassword(token: string, newPassword: string) {
  if (!token || !newPassword)
    return { message: "Token and password are required" };

  // Verify token
  const tokenRecord = await database
    .select()
    .from(passwordResetTokens)
    .where(passwordResetTokens.token.eq(token))
    .limit(1);

  if (
    !tokenRecord.length ||
    tokenRecord[0].expires < new Date() ||
    tokenRecord[0].used
  ) {
    return { message: "Invalid or expired token" };
  }

  const userId = tokenRecord[0].userId;

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update user's password
  await database
    .update(users)
    .set({ password: hashedPassword })
    .where(users.id.eq(userId));

  // Mark token as used
  await database
    .update(passwordResetTokens)
    .set({ used: true })
    .where(passwordResetTokens.token.eq(token));

  return { message: "Password successfully reset", success: true };
}
