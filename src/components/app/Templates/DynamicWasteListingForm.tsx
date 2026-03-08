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
  const [projectName, setProjectName] = useState("");
  const [startingPrice, setStartingPrice] = useState<number | "">("");
  const [date, setDate] = useState<Date | undefined>();
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(key: string, value: any) {
    setFormValues((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (submitting) return;

    if (!date) {
      alert("Please select an end date.");
      return;
    }

    if (!projectName) {
      alert("Please enter a project name.");
      return;
    }

    if (startingPrice === "" || startingPrice < 0) {
      alert("Please enter a valid starting price.");
      return;
    }

    setSubmitting(true);

    try {
      /* ================= TEMPLATE VALIDATION ================= */

      for (const section of template.sections) {
        for (const field of section.fields) {
          if (field.required && !formValues[field.key]) {
            alert(`Please fill in: ${field.label}`);
            setSubmitting(false);
            return;
          }
        }
      }

      /* ================= FILE KEYS ================= */

      const fileKeys = files.map(
        (file) => `${crypto.randomUUID()}-${file.name}`,
      );

      const uploadUrls = await createUploadUrlAction(
        fileKeys,
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

      /* ================= CREATE LISTING ================= */

      await createListingAction({
        templateId: template.id,
        templateData: formValues,
        name: projectName,
        startingPrice: Number(startingPrice),
        endDate: date,
        fileName: fileKeys,
      });

      alert("Listing created successfully!");
    } catch (error) {
      console.error(error);
      alert("Something went wrong while creating the listing.");
    }

    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-3xl">
      {/* ================= TEMPLATE STRUCTURE ================= */}

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
                  onChange={(e) =>
                    handleChange(field.key, Number(e.target.value))
                  }
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
                  <option value="">Select...</option>

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

      {/* ================= COMMERCIAL SECTION ================= */}

      <div className="border-t pt-8 space-y-6">
        <h3 className="text-lg font-semibold">Project & Commercial Details</h3>

        <div>
          <label className="block mb-2 font-medium">
            Project Name <span className="text-red-500">*</span>
          </label>

          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. North Walsham Demolition – Phase 1"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Starting Price (£) <span className="text-red-500">*</span>
          </label>

          <Input
            type="number"
            min="0"
            step="1"
            value={startingPrice}
            onChange={(e) =>
              setStartingPrice(
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            required
          />
        </div>

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
      </div>

      {/* ================= LOADING MESSAGE ================= */}

      {submitting && (
        <p className="text-sm text-gray-500">
          Please wait while we process your listing and upload files...
        </p>
      )}

      {/* ================= SUBMIT BUTTON ================= */}

      <button
        type="submit"
        disabled={submitting}
        className="bg-black text-white px-6 py-3 rounded disabled:opacity-50"
      >
        {submitting ? "Creating Listing..." : "Create Listing"}
      </button>
    </form>
  );
}
