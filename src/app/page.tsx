import React from "react";
import { database } from "@/db/database";
import { bids as bidsSchema } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";

export default async function HomePage() {
  const bids = await database.query.bids.findMany();

  return (
    <main>
      <form
        action={async (formData: FormData) => {
          "use server";
          await database?.insert(bidsSchema).values({});
          revalidatePath("/");
        }}
      >
        <input name="bid" placeholder="Bid" />
        <button type="submit">Place Bid</button>
      </form>

      {bids.map((bid) => (
        <div key={bid.id}>{bid.id}</div>
      ))}
      <div>
        <Button>Click me</Button>
      </div>
    </main>
  );
}
