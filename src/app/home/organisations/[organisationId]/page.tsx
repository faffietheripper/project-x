import { getOrganisation } from "@/data-access/organisations";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/util/files";
import { database } from "@/db/database";
import { eq } from "drizzle-orm";

export default async function OrganisationPage({
  params,
}: {
  params: { organisationId?: string };
}) {
  const { organisationId } = params;

  if (!organisationId) {
    throw new Error("organisationId param is missing.");
  }

  const organisation = await getOrganisation(organisationId);

  if (!organisation) {
    return (
      <div className=" pl-[22vw] space-y-8 py-36 px-12 flex flex-col items-center mt-12">
        <Image src="/package.svg" width="200" height="200" alt="Package" />
        <h1 className="">Organisation not found</h1>
        <p className="text-center">
          The organisation you&apos;re trying to view is invalid.
          <br />
          Please go back and search for a different company.
        </p>
        <Button asChild>
          <Link href={`/`}>View Organisations</Link>
        </Button>
      </div>
    );
  }

  const allReviews = await database.query.reviews.findMany({
    with: {
      reviewer: true,
      organisation: true,
    },
  });

  const userReviews = allReviews.filter(
    (review) => review.organisationId === organisation.id
  );

  return (
    <main className=" pl-[22vw] space-y-8 py-36 px-12">
      <div className="grid grid-cols-6 gap-6">
        <div className="col-span-4 flex flex-col gap-6">
          <div className="flex items-center gap-x-6">
            <Image
              height={100}
              width={100}
              src={getImageUrl(organisation.profilePicture)}
              alt="Logo"
              className="w-32 h-32 rounded-full object-cover"
            />
            <div>
              <h1 className="font-semibold text-2xl">
                {organisation.teamName}
              </h1>
              <h2 className="font-semibold text-lg">
                {organisation.region}, {organisation.country}
              </h2>
            </div>
          </div>

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
                      Reviewed By: {review.reviewerId || "Anonymous"}
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
            <strong>Email Address:</strong> {organisation.emailAddress}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Telephone:</strong> {organisation.telephone}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Street Address:</strong> {organisation.streetAddress}
          </p>
          <p className="text-sm text-gray-500">
            <strong>City:</strong> {organisation.city}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Region:</strong> {organisation.region}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Post Code:</strong> {organisation.postCode}
          </p>
        </div>
      </div>
    </main>
  );
}
