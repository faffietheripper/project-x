"use client";

import React from "react";
import { useState } from "react";
import {
  createUploadUrlAction,
  createItemAction,
} from "@/app/home/items/create/actions";
import { Input } from "../ui/input";
import { DatePickerDemo } from "../DatePicker";
import SelectDropdown from "./SelectDropdown";

export default function WasteListingForm() {
  const [date, setDate] = useState<Date | undefined>();
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;

    if (selectedFiles && selectedFiles.length === 3) {
      setFiles(Array.from(selectedFiles));
      setError(null); // Clear any previous errors
    } else {
      setFiles([]);
      setError("Please upload exactly 3 files.");
    }
  };

  return (
    <main>
      <form
        className="flex flex-col p-8 rounded-xl space-y-5 "
        onSubmit={async (e) => {
          e.preventDefault();

          if (!date) {
            return;
          }

          const form = e.currentTarget as HTMLFormElement;
          const formData = new FormData(form);

          const uploadUrls = await createUploadUrlAction(
            files.map((file) => file.name),
            files.map((file) => file.type)
          );

          await Promise.all(
            files.map((file, index) =>
              fetch(uploadUrls[index], {
                method: "PUT",
                body: file,
              })
            )
          );

          const name = formData.get("name") as string;
          const location = formData.get("location") as string;
          const transportationDetails = formData.get(
            "transportationDetails"
          ) as string;
          const transactionConditions = formData.get(
            "transactionConditions"
          ) as string;
          const complianceDetails = formData.get("complianceDetails") as string;
          const detailedDescription = formData.get(
            "detailedDescription"
          ) as string;

          const startingPrice = parseInt(
            formData.get("startingPrice") as string
          );
          const startingPriceInCents = Math.floor(startingPrice);

          await createItemAction({
            name,
            startingPrice: startingPriceInCents,
            fileName: files.map((file) => file.name),

            endDate: date,
            location,
            transportationDetails,
            transactionConditions,
            complianceDetails,
            detailedDescription,
          });
        }}
      >
        <section>
          <div className="mb-2 text-sm text-gray-800">
            <h1 className="pb-2 font-semibold">Waste Description :</h1>
            <ul className="list-disc list-outside px-6 pb-4">
              <li>Detailed description of the waste (type, composition)</li>
              <li>Source of waste (e.g., demolition, new build, renovation)</li>
              <li>
                Any special considerations (e.g., contamination, hazardous
                materials)
              </li>
              <li>Quality of the waste (e.g., uncontaminated, clean fill)</li>
              <li>
                Exact quantity of waste available (tons, cubic meters, etc.)
              </li>
            </ul>
          </div>
          <Input
            required
            className=""
            name="name"
            placeholder="Name your Listing e.g. Asbestos Construction Waste"
          />
          <textarea
            required
            className="w-full border rounded-md mt-2 px-3 py-2 text-sm min-h-32"
            name="detailedDescription"
            placeholder="Detailed Description of the Waste"
          />
        </section>

        <section>
          <div className="mb-2 text-sm text-gray-800">
            <h1 className="pb-2 font-semibold">Compliance and Safety :</h1>
            <ul className="list-disc list-outside px-6 pb-4">
              <li>
                Any regulatory compliance or safety considerations (e.g.,
                hazardous waste handling)
              </li>
              <li>
                Required documentation or certifications needed from the service
                provider
              </li>
            </ul>
          </div>
          <textarea
            required
            className="w-full border rounded-md mt-2 px-3 py-2 text-sm min-h-24"
            name="complianceDetails"
            placeholder="Any regulatory compliance or safety considerations"
          />
        </section>

        <section>
          <div className="mb-2 text-sm text-gray-800">
            <h1 className="pb-2 font-semibold">Pickup/Transport Details :</h1>
            <ul className="list-disc list-outside px-6 pb-4">
              <li>Location of the waste</li>
              <li>
                Whether transportation is provided or required by the service
                provider
              </li>
              <li>
                Access to the site (e.g., ease of loading, size of trucks that
                can access the site)
              </li>
            </ul>
          </div>

          <SelectDropdown />
          <textarea
            required
            className="w-full border rounded-md mt-2 px-3 py-2 text-sm min-h-24"
            name="transportationDetails"
            placeholder="Transportation Details"
          />
        </section>

        <section>
          <div className="mb-2 text-sm text-gray-800">
            <h1 className="pb-4 font-semibold">Timeframe :</h1>
            <DatePickerDemo date={date} setDate={setDate} />
          </div>
        </section>
        <section>
          <div className="mb-2 text-sm text-gray-800">
            <h1 className="pb-2 font-semibold">Prices / Terms :</h1>
            <ul className="list-disc list-outside px-6 pb-4">
              <li>
                Whether the company is offering the waste for free or looking
                for a specific service in return
              </li>
              <li>Any costs associated with waste removal or recycling</li>
            </ul>
          </div>
          <Input
            required
            className=""
            name="startingPrice"
            type="number"
            step="0.01"
            placeholder="What to start your auction at"
          />
          <textarea
            required
            className="w-full border rounded-md mt-2 px-3 py-2 text-sm min-h-24"
            name="transactionConditions"
            placeholder="Conditions of Transaction"
          />
        </section>

        <div>
          <div className="mb-2 text-sm text-gray-800">
            <h1 className="pb-2 font-semibold">Photos & Documentation :</h1>
            <ul className="list-disc list-outside px-6 pb-4">
              <li>Images of the waste</li>
              <li>
                Associated documentation (e.g., material safety data sheets,
                environmental reports)
              </li>
            </ul>
          </div>
          <label
            htmlFor="file-input"
            className="block text-sm font-medium text-gray-700"
          >
            Please Upload 3 Images [Max]
          </label>
          <Input
            type="file"
            name="file"
            id="file-input"
            multiple
            onChange={handleFileChange}
            required
            className="mt-2"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Preview of selected files */}
        {files.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700">
              Selected Files:
            </h4>
            <ul className="list-disc list-inside mt-2">
              {files.map((file, index) => (
                <li key={index} className="text-sm text-gray-500">
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          className="bg-blue-600 text-white py-2 px-4 rounded-md self-end"
          type="submit"
        >
          Submit Waste Listing
        </button>
      </form>
    </main>
  );
}
