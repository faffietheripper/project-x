import React from "react";
import { database } from "@/db/database";
import { bids as bidsSchema, items } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { Input } from "@/components/ui/input";
import { createItemAction } from "./action";

export default async function CreatePage() {
  return (
    <main className="p-10">
      <h1 className="font-bold text-4xl py-2 "> Post an item to sell </h1>
      <form
        className="flex flex-col max-w-lg border border-gray rounded-lg p-4 space-y-4"
        action={createItemAction}
      >
        <Input
          required
          name="name"
          className="max-w-lg"
          placeholder="Name your item"
        />
        <Input
          required
          className="max-w-lg"
          name="startingPrice"
          type="number"
          step="0.01"
          placeholder="What to start your auction at"
        />
        <Button type="submit" className="self-end">
          Post Item
        </Button>
      </form>
    </main>
  );
}
