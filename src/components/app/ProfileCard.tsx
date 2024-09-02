import React from "react";
import Image from "next/image";
import { getImageUrl } from "@/util/files";
import Link from "next/link";
import { auth } from "@/auth";

export default async function ProfileCard({ profile }) {
  const session = await auth();

  const profileImageUrl = profile.profilePicture
    ? getImageUrl(profile.profilePicture)
    : "/default-profile.png"; // Default profile image if none is provided

  return (
    <div
      key={profile.id}
      className="border p-6 rounded-lg w-full flex flex-col gap-6 justify-between"
    >
      <div className="flex flex-col">
        <Image
          src={profileImageUrl}
          width={200}
          height={200}
          alt={profile.companyName}
          className="rounded-lg h-48 w-full object-cover"
        />
        <h1 className="text-lg font-semibold mt-10">{profile.companyName}</h1>
        <p className="text-xs text-gray-500 mb-2">
          {profile.city}, {profile.country}
        </p>
      </div>
      <Link href={`/home/profiles/${profile.id}`}>
        <button className="bg-blue-600 py-2 px-4 rounded-md w-full text-white">
          View Company
        </button>
      </Link>
    </div>
  );
}
