"use server";

import { database } from "@/db/database";
import { items } from "@/db/schema";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function createItemAction(formData: FormData) {
  const session = await auth();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const user = session.user;

  if (!user || !user.id) {
    throw new Error("Unauthorized");
  }

  await database.insert(items).values({
    name: formData.get("name") as string,
    userId: user.id,
    startingPrice: Number(formData.get("startingPrice")),
  });

  redirect("/");
}
