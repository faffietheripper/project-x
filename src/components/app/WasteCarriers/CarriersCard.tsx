import React from "react";
import Image from "next/image";
import { getImageUrl } from "@/util/files";
import Link from "next/link";

export default function CarriersCard({ organisation }) {
  const profileImageUrl = organisation.profilePicture
    ? getImageUrl(organisation.profilePicture)
    : "/default-profile.png";

  return (
    <div className="border p-6 rounded-lg flex flex-col gap-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <Image
        src={profileImageUrl}
        width={200}
        height={200}
        alt={organisation.teamName}
        className="rounded-lg h-48 w-full object-cover"
      />
      <div>
        <h2 className="text-lg font-semibold">{organisation.teamName}</h2>
        <p className="text-sm text-gray-500">
          {organisation.city}, {organisation.country}
        </p>
      </div>
      <Link href={`/home/organisations/${organisation.id}`}>
        <button className="bg-blue-600 py-2 px-4 rounded-md w-full text-white hover:bg-blue-700 transition">
          View Company
        </button>
      </Link>
    </div>
  );
}
