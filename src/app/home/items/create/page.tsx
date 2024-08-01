"use client";

import {
  createItemAction,
  createUploadUrlAction,
} from "@/app/home/items/create/actions";
import { DatePickerDemo } from "@/components/DatePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import PostJobIntro from "@/components/app/PostJobIntro";

export default function CreatePage() {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <main className="space-y-8 m-10">
      <PostJobIntro />
      <form
        className="flex flex-col border border-black p-8 rounded-xl space-y-5 "
        onSubmit={async (e) => {
          e.preventDefault();

          if (!date) {
            return;
          }

          const form = e.currentTarget as HTMLFormElement;
          const formData = new FormData(form);
          const file = formData.get("file") as File;

          const uploadUrl = await createUploadUrlAction(file.name, file.type);

          await fetch(uploadUrl, {
            method: "PUT",
            body: file,
          });

          const name = formData.get("name") as string;
          const startingPrice = parseInt(
            formData.get("startingPrice") as string
          );
          const startingPriceInCents = Math.floor(startingPrice * 100);

          await createItemAction({
            name,
            startingPrice: startingPriceInCents,
            fileName: file.name,
            endDate: date,
          });
        }}
      >
        <Input required className="" name="name" placeholder="Name your item" />
        <Input
          required
          className=""
          name="startingPrice"
          type="number"
          step="0.01"
          placeholder="What to start your auction at"
        />
        <Input type="file" name="file"></Input>
        <DatePickerDemo date={date} setDate={setDate} />
        <Button className="self-end" type="submit">
          Post Item
        </Button>
      </form>
    </main>
  );
}
