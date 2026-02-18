"use server";

import { signIn } from "@/auth";
import { database } from "@/db/database";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { LoginSchema } from "@/util/authSchema";

export async function getUserFromDb(email: string, password?: string) {
  try {
    // Fetch user by email
    const user = await database.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return { success: false, message: "User not found." };
    }

    // If password provided, check hash
    if (password) {
      const isValid = await bcrypt.compare(password, user.passwordHash!);
      if (!isValid) {
        return { success: false, message: "Incorrect password." };
      }
    }

    // Check active/suspended status
    if (!user.isActive || user.isSuspended) {
      return { success: false, message: "Account inactive or suspended." };
    }

    return { success: true, data: user };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    LoginSchema.parse({ email, password });

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (!res || res.error) {
      return { success: false, message: res?.error || "Login failed." };
    }

    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
