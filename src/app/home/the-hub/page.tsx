import React from "react";
import { database } from "@/db/database";
import ProfileCard from "@/components/app/ProfileCard";

export default async function FilteredProfilesPage({ searchParams }) {
  const { location, role } = searchParams;

  // Fetch all profiles along with their associated user data
  const allProfiles = await database.query.profiles.findMany({
    with: {
      user: true, // This ensures that the user data is fetched along with the profile
    },
  });

  // Filter profiles based on query parameters
  const filteredProfiles = allProfiles
    .filter((profile) => {
      if (location) {
        return profile.region === location;
      }
      return true;
    })

    .filter((profile) => {
      if (role) {
        return profile.user.role === role;
      }
      return true;
    });

  return (
    <main className="">
      <h1 className="text-4xl font-bold mb-10 text-center">
        Welcome to the Hub
      </h1>
      <div className="grid grid-cols-4 gap-8">
        {filteredProfiles.length > 0 ? (
          filteredProfiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))
        ) : (
          <p className="text-gray-600">No profiles match your criteria.</p>
        )}
      </div>
    </main>
  );
}
