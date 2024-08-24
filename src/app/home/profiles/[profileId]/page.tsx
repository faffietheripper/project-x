import { auth } from "@/auth";
import { getProfile } from "@/data-access/profiles";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProfilePage({
  params: { profileId },
}: {
  params: { profileId: string };
}) {
  const session = await auth();

  const profile = await getProfile(parseInt(profileId));

  if (!profile) {
    return (
      <div className="space-y-8 py-36 px-12 flex flex-col items-center mt-12">
        <Image src="/package.svg" width="200" height="200" alt="Package" />

        <h1 className="">Profile not found</h1>
        <p className="text-center">
          The profile you&apos;re trying to view is invalid.
          <br />
          Please go back and search for a different company profile.
        </p>

        <Button asChild>
          <Link href={`/`}>View Profiles</Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="space-y-8 py-36 px-12">
      <div className="grid grid-cols-6 gap-6">
        <div className="col-span-4 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-2xl">
              Profile of {profile.companyName}
            </h1>
          </div>
          <h2 className="font-semibold text-lg">
            Located in{" "}
            <span className="font-normal text-gray-500">
              {profile.city}, {profile.region}, {profile.country}
            </span>
          </h2>
          <p className="text-xs text-gray-500">
            <span className="text-lg text-black block font-semibold">
              Company Overview:
            </span>{" "}
            {profile.companyOverview}
          </p>
          <p className="text-xs text-gray-500">
            <span className="text-lg text-black block font-semibold">
              Waste Management Method:
            </span>{" "}
            {profile.wasteManagementMethod}
          </p>
          <p className="text-xs text-gray-500">
            <span className="text-lg text-black block font-semibold">
              Waste Management Needs:
            </span>{" "}
            {profile.wasteManagementNeeds}
          </p>
          <p className="text-xs text-gray-500">
            <span className="text-lg text-black block font-semibold">
              Contact Information:
            </span>{" "}
            <br />
            Telephone: {profile.telephone}
            <br />
            Email: {profile.emailAddress}
          </p>
        </div>

        <div className="col-span-2 space-y-4 p-6 rounded-lg bg-gray-100">
          <h2 className="text-2xl font-semibold">Company Details</h2>
          <p className="text-sm text-gray-500">
            <strong>Street Address:</strong> {profile.streetAddress}
          </p>
          <p className="text-sm text-gray-500">
            <strong>City:</strong> {profile.city}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Region:</strong> {profile.region}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Post Code:</strong> {profile.postCode}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Certifications:</strong> {profile.certifications}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Environmental Policy:</strong> {profile.environmentalPolicy}
          </p>
        </div>
      </div>
    </main>
  );
}
