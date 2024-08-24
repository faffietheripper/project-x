import React from "react";
import { database } from "@/db/database";
import { profiles } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import Image from "next/image";
import { getImageUrl } from "@/util/files";

export default async function MyProfile() {
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
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Company Information</h2>
          <p>
            <strong>Company Name:</strong> {profile.companyName}
          </p>
          <p>
            <strong>Company Overview:</strong> {profile.companyOverview}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Contact Information</h2>
          <p>
            <strong>Telephone:</strong> {profile.telephone}
          </p>
          <p>
            <strong>Email Address:</strong> {profile.emailAddress}
          </p>
          <p>
            <strong>Country:</strong> {profile.country}
          </p>
          <p>
            <strong>Street Address:</strong> {profile.streetAddress}
          </p>
          <p>
            <strong>City:</strong> {profile.city}
          </p>
          <p>
            <strong>Region:</strong> {profile.region}
          </p>
          <p>
            <strong>Post Code:</strong> {profile.postCode}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Waste Management</h2>
          <p>
            <strong>Waste Management Method:</strong>{" "}
            {profile.wasteManagementMethod}
          </p>
          <p>
            <strong>Waste Management Needs:</strong>{" "}
            {profile.wasteManagementNeeds}
          </p>
          {profile.wasteType && (
            <p>
              <strong>Waste Type:</strong> {profile.wasteType}
            </p>
          )}
          {profile.environmentalPolicy && (
            <p>
              <strong>Environmental Policy:</strong>{" "}
              {profile.environmentalPolicy}
            </p>
          )}
        </div>

        {profile.profilePicture && (
          <div>
            <h2 className="text-xl font-semibold">Profile Picture</h2>
            <Image
              height={900}
              width={900}
              src={getImageUrl(profile.profilePicture)}
              alt="Profile"
              className="w-32 h-32 rounded-full"
            />
          </div>
        )}

        {profile.certifications && (
          <div>
            <h2 className="text-xl font-semibold">Certifications</h2>
            <ul className="list-disc list-inside">
              {profile.certifications.split(",").map((cert, index) => (
                <li key={index}>
                  <a
                    href={getImageUrl(cert)}
                    target="_blank"
                    rel="noopener noreferrer"
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
