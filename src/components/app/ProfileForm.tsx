"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createUploadUrlAction,
  saveProfileAction,
  fetchProfileAction,
} from "@/app/home/me/actions";
import { getImageUrl } from "@/util/files";

export default function ProfileForm() {
  // Initialize profileData as an empty object to avoid null errors
  const [profileData, setProfileData] = useState<any>({});
  const [files, setFiles] = useState<File[]>([]);
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const [newCertifications, setNewCertifications] = useState<File[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const profile = await fetchProfileAction();
      setProfileData(profile || {}); // Ensure profileData is always an object
    }

    loadProfile();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = event.target;
    if (files) {
      if (name === "profilePicture") {
        setNewProfilePicture(files[0]);
      } else if (name === "newCertifications") {
        setNewCertifications(Array.from(files));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const certificationNames = newCertifications.map((file) => file.name);
    const certificationTypes = newCertifications.map((file) => file.type);

    const uploadUrls = await createUploadUrlAction(
      [
        newProfilePicture?.name || profileData?.profilePicture || "",
        ...certificationNames,
      ],
      [newProfilePicture?.type || "", ...certificationTypes]
    );

    if (newProfilePicture) {
      await fetch(uploadUrls[0], {
        method: "PUT",
        body: newProfilePicture,
      });
    }

    if (newCertifications.length > 0) {
      await Promise.all(
        newCertifications.map((file, index) =>
          fetch(uploadUrls[index + 1], {
            method: "PUT",
            body: file,
          })
        )
      );
    }

    await saveProfileAction({
      profilePicture:
        newProfilePicture?.name || profileData?.profilePicture || "",
      companyName: formData.get("companyName") as string,
      companyOverview: formData.get("companyOverview") as string,
      telephone: formData.get("telephone") as string,
      emailAddress: formData.get("emailAddress") as string,
      country: formData.get("country") as string,
      streetAddress: formData.get("streetAddress") as string,
      city: formData.get("city") as string,
      region: formData.get("region") as string,
      postCode: formData.get("postCode") as string,
      wasteManagementMethod: formData.get("wasteManagementMethod") as string,
      wasteManagementNeeds: formData.get("wasteManagementNeeds") as string,
      wasteType: formData.get("wasteType") as string,
      environmentalPolicy: formData.get("environmentalPolicy") as string,
      certifications: [
        ...(profileData?.certifications?.split(",") || []),
        ...certificationNames,
      ],
    });

    alert("Profile saved successfully!");
    router.push("/home/my-activity");
  };

  return (
    <main>
      <form
        className="flex flex-col p-8 rounded-xl space-y-5"
        onSubmit={handleSubmit}
      >
        <section>
          <div className="mb-2 text-sm text-gray-800">
            <h1 className="pb-2 font-semibold">Company Information:</h1>
          </div>
          <label>Name used to make bids</label>
          <input
            required
            className="w-full border rounded-md mt-2 px-3 py-2 text-sm"
            name="companyName"
            placeholder="Company Name"
            defaultValue={profileData.companyName || ""}
          />
          <textarea
            required
            className="w-full border rounded-md mt-2 px-3 py-2 text-sm min-h-24"
            name="companyOverview"
            placeholder="Company Overview"
            defaultValue={profileData.companyOverview || ""}
          />
        </section>

        <section>
          <div className="mb-2 text-sm text-gray-800">
            <h1 className="pb-2 font-semibold">Contact Information:</h1>
          </div>
          <input
            required
            className="w-full border rounded-md mt-2 px-3 py-2 text-sm"
            name="telephone"
            placeholder="Telephone"
            defaultValue={profileData.telephone || ""}
          />
          <input
            required
            className="w-full border rounded-md mt-2 px-3 py-2 text-sm"
            name="emailAddress"
            placeholder="Email Address"
            defaultValue={profileData.emailAddress || ""}
          />
          <input
            required
            className="w-full border rounded-md mt-2 px-3 py-2 text-sm"
            name="country"
            placeholder="Country"
            defaultValue={profileData.country || ""}
          />
          <input
            required
            className="w-full border rounded-md mt-2 px-3 py-2 text-sm"
            name="streetAddress"
            placeholder="Street Address"
            defaultValue={profileData.streetAddress || ""}
          />
          <input
            required
            className="w-full border rounded-md mt-2 px-3 py-2 text-sm"
            name="city"
            placeholder="City"
            defaultValue={profileData.city || ""}
          />
          <input
            required
            className="w-full border rounded-md mt-2 px-3 py-2 text-sm"
            name="region"
            placeholder="Region"
            defaultValue={profileData.region || ""}
          />
          <input
            required
            className="w-full border rounded-md mt-2 px-3 py-2 text-sm"
            name="postCode"
            placeholder="Post Code"
            defaultValue={profileData.postCode || ""}
          />
        </section>

        <section>
          <div className="mb-2 text-sm text-gray-800">
            <h1 className="pb-2 font-semibold">Waste Management:</h1>
          </div>
          <input
            required
            className="w-full border rounded-md mt-2 px-3 py-2 text-sm"
            name="wasteManagementMethod"
            placeholder="Waste Management Method"
            defaultValue={profileData.wasteManagementMethod || ""}
          />
          <textarea
            required
            className="w-full border rounded-md mt-2 px-3 py-2 text-sm min-h-24"
            name="wasteManagementNeeds"
            placeholder="Waste Management Needs"
            defaultValue={profileData.wasteManagementNeeds || ""}
          />
          <input
            className="w-full border rounded-md mt-2 px-3 py-2 text-sm"
            name="wasteType"
            placeholder="Waste Type (Optional)"
            defaultValue={profileData.wasteType || ""}
          />
          <textarea
            className="w-full border rounded-md mt-2 px-3 py-2 text-sm min-h-24"
            name="environmentalPolicy"
            placeholder="Environmental Policy (Optional)"
            defaultValue={profileData.environmentalPolicy || ""}
          />
        </section>

        <div>
          <div className="mb-2 text-sm text-gray-800">
            <h1 className="pb-2 font-semibold">
              Profile Picture & Certifications:
            </h1>
          </div>

          {/* Display existing profile picture */}
          {profileData.profilePicture && (
            <div className="mb-4">
              <h2 className="text-sm font-medium text-gray-700">
                Current Profile Picture
              </h2>
              <img
                src={getImageUrl(profileData.profilePicture)}
                alt="Profile"
                className="rounded-lg h-32 w-32 object-cover"
              />
            </div>
          )}

          <label
            htmlFor="profilePicture"
            className="block text-sm font-medium text-gray-700"
          >
            Update Profile Picture (Optional)
          </label>
          <input
            type="file"
            name="profilePicture"
            id="profilePicture"
            onChange={handleFileChange}
            className="mt-2"
          />

          {/* Display existing certifications */}
          {profileData.certifications && (
            <div className="mt-4">
              <h2 className="text-sm font-medium text-gray-700">
                Existing Certifications
              </h2>
              <ul className="list-disc list-inside mt-2">
                {profileData.certifications.split(",").map((cert, index) => (
                  <li key={index}>
                    <a
                      href={getImageUrl(cert)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      {cert}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <label
            htmlFor="newCertifications"
            className="block text-sm font-medium text-gray-700 mt-4"
          >
            Upload New Certifications
          </label>
          <input
            type="file"
            name="newCertifications"
            id="newCertifications"
            multiple
            onChange={handleFileChange}
            className="mt-2"
          />

          {/* Preview of selected new certification files */}
          {newCertifications.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700">
                Selected New Certifications:
              </h4>
              <ul className="list-disc list-inside mt-2">
                {newCertifications.map((file, index) => (
                  <li key={index} className="text-sm text-gray-500">
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button
          className="bg-blue-600 text-white py-2 px-4 rounded-md self-end"
          type="submit"
        >
          Save Profile
        </button>
      </form>
    </main>
  );
}
