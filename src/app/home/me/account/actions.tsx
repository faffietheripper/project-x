//action to manage password

"use server";

import { auth } from "@/auth";
import { database } from "@/db/database";
import { users } from "@/db/schema";
import bcryptjs from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function updatePassword({
  userId,
  currentPassword,
  newPassword,
}: {
  userId: string;
  currentPassword?: string;
  newPassword: string;
}) {
  try {
    // Find the user by ID
    const user = await database.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    // If currentPassword is provided, verify it
    if (currentPassword) {
      const isMatch = await bcryptjs.compare(currentPassword, user.password);
      if (!isMatch) {
        return {
          success: false,
          message: "Current password is incorrect.",
        };
      }
    }

    // Hash the new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update the user's password in the database
    await database
      .update(users)
      .set({
        password: hashedPassword,
      })
      .where(eq(users.id, userId));

    return {
      success: true,
      message: "Password updated successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while updating the password.",
    };
  }
}

//action to delete account
export async function deleteAccountAction() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    throw new Error("Unauthorized");
  }

  await database.delete(users).where(eq(users.id, session.user.id));

  // Redirect the user to the homepage
  redirect("/");
}
