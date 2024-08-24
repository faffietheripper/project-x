"use server";

import { signIn } from "@/auth";
import { database } from "@/db/database";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { LoginSchema } from "@/util/authSchema";

export async function getUserFromDb(email: string, password: string) {
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

    const isPasswordValid = await bcrypt.compare(
      password,
      existedUser.password
    );
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Password entered is wrong.",
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

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    LoginSchema.parse({
      email,
      password,
    });

    const user = await getUserFromDb(email, password);
    if (!user.success) {
      return {
        success: false,
        message: "Email or password is incorrect.",
      };
    }

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    return {
      success: true,
      data: res,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "An error occurred during login.",
    };
  }
}
