"use client";

import { useState } from "react";
import {
  createListingAction,
  createUploadUrlAction,
} from "@/app/home/create-waste-listings/actions";
import { DatePickerDemo } from "@/components/DatePicker";
import { Input } from "@/components/ui/input";

export default function DynamicWasteListingForm({ template }: any) {
  const [formValues, setFormValues] = useState<any>({});
  const [date, setDate] = useState<Date | undefined>();
  const [files, setFiles] = useState<File[]>([]);

  function handleChange(key: string, value: any) {
    setFormValues((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!date) return;

    const uploadUrls = await createUploadUrlAction(
      files.map((f) => f.name),
      files.map((f) => f.type),
    );

    await Promise.all(
      files.map((file, i) =>
        fetch(uploadUrls[i], {
          method: "PUT",
          body: file,
        }),
      ),
    );

    await createListingAction({
      templateId: template.id,
      templateVersion: template.version,
      templateData: formValues,
      name: formValues.name || "Waste Listing",
      startingPrice: parseInt(formValues.startingPrice || 0),
      endDate: date,
      fileName: files.map((f) => f.name),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {template.sections.map((section: any) => (
        <div key={section.id}>
          <h3 className="text-lg font-semibold mb-4">{section.title}</h3>

          {section.fields.map((field: any) => (
            <div key={field.id} className="mb-5">
              <label className="block mb-2 font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.fieldType === "text" && (
                <input
                  required={field.required}
                  className="border p-3 w-full rounded"
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              )}

              {field.fieldType === "number" && (
                <input
                  type="number"
                  required={field.required}
                  className="border p-3 w-full rounded"
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              )}

              {field.fieldType === "boolean" && (
                <input
                  type="checkbox"
                  onChange={(e) => handleChange(field.key, e.target.checked)}
                />
              )}

              {field.fieldType === "dropdown" && (
                <select
                  required={field.required}
                  className="border p-3 w-full rounded"
                  onChange={(e) => handleChange(field.key, e.target.value)}
                >
                  <option>Select...</option>
                  {JSON.parse(field.optionsJson || "[]").map((opt: string) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      ))}

      <div>
        <label className="block mb-2 font-medium">End Date</label>
        <DatePickerDemo date={date} setDate={setDate} />
      </div>

      <div>
        <label className="block mb-2 font-medium">Upload Files</label>
        <Input
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />
      </div>

      <button type="submit" className="bg-black text-white px-6 py-3 rounded">
        Create Listing
      </button>
    </form>
  );
}
