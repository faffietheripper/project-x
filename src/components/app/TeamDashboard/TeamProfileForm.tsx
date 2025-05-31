"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createUploadUrlAction,
  saveProfileAction,
  fetchProfileAction,
} from "@/app/home/team-dashboard/team-profile/actions";
import { getImageUrl } from "@/util/files";

export default function TeamProfileForm() {
  const [profileData, setProfileData] = useState({});
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [chainOfCustody, setChainOfCustody] = useState("wasteGenerator");
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const profile = await fetchProfileAction();
      setProfileData(profile || {});
      if (profile?.chainOfCustody) {
        setChainOfCustody(profile.chainOfCustody);
      }
    }

    loadProfile();
  }, []);

  const handleFileChange = (event) => {
    const { files } = event.target;
    if (files?.length > 0) {
      setNewProfilePicture(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const uploadUrls = await createUploadUrlAction(
      [newProfilePicture?.name || profileData?.profilePicture || ""],
      [newProfilePicture?.type || ""]
    );

    if (newProfilePicture) {
      await fetch(uploadUrls[0], {
        method: "PUT",
        body: newProfilePicture,
      });
    }

    await saveProfileAction({
      profilePicture:
        newProfilePicture?.name || profileData?.profilePicture || "",
      teamName: formData.get("teamName"),
      chainOfCustody,
      industry: formData.get("industry"),
      telephone: formData.get("telephone"),
      emailAddress: formData.get("emailAddress"),
      country: formData.get("country"),
      streetAddress: formData.get("streetAddress"),
      city: formData.get("city"),
      region: formData.get("region"),
      postCode: formData.get("postCode"),
    });

    alert("Profile saved successfully!");
    router.push("/home/my-activity");
  };

  return (
    <main>
      <form
        className="flex justify-center flex-col rounded-xl space-y-5 pb-10"
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 justify-items-center">
          <div className="mb-2 text-sm text-gray-800">
            <h1 className="pb-2 font-semibold">Profile Picture:</h1>
          </div>

          {profileData.profilePicture && (
            <div className="mb-4">
              <img
                src={getImageUrl(profileData.profilePicture)}
                alt="Profile"
                className="rounded-full mb-2 h-32 w-32 object-cover"
              />
            </div>
          )}

          <input
            type="file"
            name="profilePicture"
            id="profilePicture"
            onChange={handleFileChange}
            className="mt-2 ml-32"
          />
        </div>

        <section>
          <div className="mb-2 text-sm text-gray-800">
            <h1 className="pb-2 font-semibold">Profile Details :</h1>
          </div>

          <label className="block text-sm font-medium text-gray-700 mt-4">
            Team Name
          </label>
          <input
            required
            className="w-full border rounded-md mt-2 px-3 py-2 text-sm"
            name="teamName"
            placeholder="Team Name"
            defaultValue={profileData.teamName || ""}
          />
          <label className="block text-sm font-medium text-gray-700 mt-4">
            Industry
          </label>
          <input
            required
            className="w-full border rounded-md mt-2 px-3 py-2 text-sm"
            name="industry"
            placeholder="Industry"
            defaultValue={profileData.industry || ""}
          />
        </section>

        <section>
          <div className="grid grid-cols-3 gap-4 ">
            <div>
              <label className="block text-sm font-medium text-gray-700 mt-4">
                Telephone
              </label>
              <input
                required
                className="w-full border rounded-md mt-2 px-3 py-2 text-sm"
                name="telephone"
                placeholder="Telephone"
                defaultValue={profileData.telephone || ""}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mt-4">
                Email Address
              </label>
              <input
                required
                className="w-full border  rounded-md mt-2 px-3 py-2 text-sm"
                name="emailAddress"
                placeholder="Email Address"
                defaultValue={profileData.emailAddress || ""}
              />
            </div>
          </div>

          <section className="my-10">
            <h1 className="pb-2 font-semibold mb-2 text-sm text-gray-800">
              Physical Address:
            </h1>

            <label className="block text-sm font-medium text-gray-700 mt-4">
              Street Address
            </label>
            <input
              required
              className="w-full border rounded-md mt-2 px-3 py-2 text-sm"
              name="streetAddress"
              placeholder="Street Address"
              defaultValue={profileData.streetAddress || ""}
            />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mt-4">
                  Post Code
                </label>
                <input
                  required
                  className="w-full border rounded-md mt-2 px-3 py-2 text-sm"
                  name="postCode"
                  placeholder="Post Code"
                  defaultValue={profileData.postCode || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mt-4">
                  City
                </label>
                <input
                  required
                  className="w-full border rounded-md mt-2 px-3 py-2 text-sm"
                  name="city"
                  placeholder="City"
                  defaultValue={profileData.city || ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mt-4">
                  Region
                </label>
                <input
                  required
                  className="w-full border rounded-md mt-2 px-3 py-2 text-sm"
                  name="region"
                  placeholder="Region"
                  defaultValue={profileData.region || ""}
                />
              </div>
            </div>

            <label className="block text-sm font-medium text-gray-700 mt-4">
              Country
            </label>
            <input
              required
              className="w-full border rounded-md mt-2 px-3 py-2 text-sm"
              name="country"
              placeholder="Country"
              defaultValue={profileData.country || ""}
            />
          </section>
        </section>

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
