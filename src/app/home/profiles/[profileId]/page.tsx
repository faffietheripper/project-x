import { auth } from "@/auth";
import { getProfile } from "@/data-access/profiles";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/util/files";
import { database } from "@/db/database";
import { eq } from "drizzle-orm";
import { users, reviews } from "@/db/schema";

export default async function ProfilePage({
  params: { profileId },
}: {
  params: { profileId: string };
}) {
  const session = await auth();

  const profile = await getProfile(parseInt(profileId));

  const userId = session.user.id;

  const allReviews = await database.query.reviews.findMany({
    with: {
      reviewer: true,
      profile: true,
    },
  });

  const userReviews = allReviews.filter(
    (review) => review.profileId === profile.id
  );

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
  const user = await database.query.users.findFirst({
    where: eq(users.id, profile.userId),
  });

  const userRole = user?.role;

  return (
    <main className="space-y-8 py-36 px-12">
      <div className="grid grid-cols-6 gap-6">
        <div className="col-span-4 flex flex-col gap-6">
          <div className="flex items-center gap-x-6 ">
            <Image
              height={100}
              width={100}
              src={getImageUrl(profile.profilePicture)}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover"
            />
            <div>
              <h1 className="font-semibold text-2xl">{profile.companyName}</h1>
              <h2 className="font-semibold text-lg">
                {profile.region}, {profile.country}
              </h2>
            </div>
          </div>

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
          {userRole === "wasteGenerator" && (
            <p className="text-xs text-gray-500">
              <span className="text-lg text-black block font-semibold">
                Waste Management Needs:
              </span>{" "}
              {profile.wasteManagementNeeds}
            </p>
          )}
          {userRole === "wasteManager" && (
            <p className="text-xs text-gray-500">
              <span className="text-lg text-black block font-semibold">
                Services Offered:
              </span>{" "}
              {profile.servicesOffered}
            </p>
          )}
          <p className="text-xs text-gray-500">
            <span className="text-lg text-black block font-semibold">
              Environmental Policy:
            </span>{" "}
            <br />
            {profile.environmentalPolicy}
          </p>

          <section className="p-6 bg-gray-100 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Reviews</h2>

            {userReviews.length > 0 ? (
              <ul className="grid grid-cols-2">
                {userReviews.map((review) => (
                  <li
                    key={review.id}
                    className="border rounded-lg p-4 shadow-sm bg-white"
                  >
                    <h2 className="text-lg font-semibold">
                      Reviewed By: {review.reviewer?.name || "Anonymous"}
                    </h2>

                    <p className="text-gray-600 py-3">
                      <strong>Rating:</strong> {review.rating} / 5
                    </p>
                    <p className="mt-2">" {review.reviewText} "</p>
                    <p className="text-sm text-right text-gray-400 mt-2">
                      {new Date(review.timestamp).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No reviews found.</p>
            )}
          </section>
        </div>

        <div className="col-span-2 space-y-4 p-6 rounded-lg bg-gray-100">
          <h2 className="text-2xl font-semibold">Company Details</h2>
          <p className="text-sm text-gray-500">
            <strong>Email Address:</strong> {profile.emailAddress}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Telephone:</strong> {profile.telephone}
          </p>
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

          <p className="text-sm text-gray-500 flex flex-col">
            <strong className="mb-3">Environmental Certifications:</strong>{" "}
            <ul className="list-disc list-inside text-sm">
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
          </p>
        </div>
      </div>
    </main>
  );
}
