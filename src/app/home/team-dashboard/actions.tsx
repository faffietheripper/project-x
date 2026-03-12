"use server";

import { database } from "@/db/database";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { RegisterSchema } from "@/util/authSchema";
import bcryptjs from "bcryptjs";
import { auth } from "@/auth";

type UserRole = "administrator" | "employee" | "seniorManagement";

export async function getUserFromDb(email: string) {
  try {
    const existedUser = await database.query.users.findFirst({
      where: eq(users.email, email),
      columns: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!existedUser) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    return {
      success: true,
      data: existedUser,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}

export async function registerTeamUser({
  name,
  email,
  password,
  confirmPassword,
  role,
}: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    RegisterSchema.parse({ name, email, password, confirmPassword });

    const existing = await database.query.users.findFirst({
      where: eq(users.email, email),
      columns: { id: true },
    });

    if (existing) {
      return { success: false, message: "User already exists." };
    }

    const adminUser = await database.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { organisationId: true },
    });

    if (!adminUser?.organisationId) {
      return {
        success: false,
        message: "Admin user does not belong to any organisation.",
      };
    }

    const hash = await bcryptjs.hash(password, 10);

    const [newUser] = await database
      .insert(users)
      .values({
        name,
        email,
        passwordHash: hash, // ✅ correct column
        role,
        organisationId: adminUser.organisationId,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
      });

    return { success: true, data: newUser };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
