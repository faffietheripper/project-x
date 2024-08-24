"use server";

import { signIn, signOut } from "@/auth";
import { database } from "@/db/database";
import { users } from "@/db/schema";
import { RegisterSchema } from "@/util/authSchema";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";

export async function getUserFromDb(email: string) {
  try {
    const existedUser = await database.query.users.findFirst({
      where: eq(users.email, email),
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

export async function registerUser({
  name,
  email,
  password,
  confirmPassword,
}: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  try {
    // Validate the input data against the schema
    RegisterSchema.parse({
      name,
      email,
      password,
      confirmPassword,
    });

    // Check if the user already exists
    const existedUser = await getUserFromDb(email);
    if (existedUser.success) {
      return {
        success: false,
        message: "User already exists.",
      };
    }

    // Hash the password
    const hash = await bcryptjs.hash(password, 10);

    // Insert the new user into the database
    const [user] = await database
      .insert(users)
      .values({
        name,
        email,
        password: hash,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
      });

    return {
      success: true,
      data: user,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}
