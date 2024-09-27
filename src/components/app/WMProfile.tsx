import React from "react";
import { database } from "@/db/database";
import { profiles } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import Image from "next/image";
import { getImageUrl } from "@/util/files";
import Link from "next/link";

export default async function WMProfile() {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const profileArray = await database
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId));

  const profile = profileArray[0];

  if (!profile) {
    return <div>No profile data found.</div>;
  }

  return (
    <main className="p-8 bg-white shadow-lg rounded-lg mx-auto">
      <div className="flex items-center justify-between mb-8">
        <section className="flex items-center">
          {profile.profilePicture && (
            <div className="mr-6">
              <Image
                height={100}
                width={100}
                src={getImageUrl(profile.profilePicture)}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>
          )}
          <p className="text-4xl font-semibold">{profile.companyName}</p>
        </section>
        <Link href="/home/me">
          <button className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md">
            Edit Profile
          </button>
        </Link>
      </div>

      <section className="space-y-8">
        <div className="p-6 bg-gray-100 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Company Overview</h2>

          <p className="text-md">{profile.companyOverview}</p>
        </div>

        <div className="p-6 bg-gray-100 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p className="text-lg">
            <strong>Telephone:</strong> {profile.telephone}
          </p>
          <p className="text-lg">
            <strong>Email Address:</strong> {profile.emailAddress}
          </p>
          <p className="text-lg">
            <strong>Country:</strong> {profile.country}
          </p>
          <p className="text-lg">
            <strong>Street Address:</strong> {profile.streetAddress}
          </p>
          <p className="text-lg">
            <strong>City:</strong> {profile.city}
          </p>
          <p className="text-lg">
            <strong>Region:</strong> {profile.region}
          </p>
          <p className="text-lg">
            <strong>Post Code:</strong> {profile.postCode}
          </p>
        </div>

        <div className="p-6 bg-gray-100 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Services Offered</h2>
          <p className="text-lg">
            <strong>Waste Management Method:</strong>{" "}
            {profile.wasteManagementMethod}
          </p>
          <p className="text-lg">
            <strong>Waste Management Services Offered:</strong>{" "}
            {profile.servicesOffered}
          </p>
          {profile.wasteType && (
            <p className="text-lg">
              <strong>Waste Type:</strong> {profile.wasteType}
            </p>
          )}
          {profile.environmentalPolicy && (
            <p className="text-lg">
              <strong>Environmental Policy:</strong>{" "}
              {profile.environmentalPolicy}
            </p>
          )}
        </div>

        {profile.certifications && (
          <div className="p-6 bg-gray-100 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Certifications</h2>
            <ul className="list-disc list-inside text-lg">
              {profile.certifications.split(",").map((cert, index) => (
                <li key={index}>
                  <a
                    href={getImageUrl(cert)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {cert}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
