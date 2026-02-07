import { auth } from "@/auth";
import { getOrganisationServer } from "@/data-access/organisations";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/util/files";
import { database } from "@/db/database";
import AssignCarrierModal from "@/components/app/WasteCarriers/AssignCarrierModal";

export default async function OrganisationPage({
  params,
}: {
  params: { organisationId?: string };
}) {
  const { organisationId } = params;

  if (!organisationId) {
    throw new Error("organisationId param is missing.");
  }

  // ✅ Get logged-in user session (not needed for logic, but useful for future features)
  const session = await auth();
  console.log("🧭 Session user:", session?.user);

  // ✅ Fetch the organisation being viewed
  const organisation = await getOrganisationServer(organisationId);

  if (!organisation) {
    return (
      <div className="pl-[22vw] space-y-8 py-36 px-12 flex flex-col items-center mt-12">
        <Image src="/package.svg" width={200} height={200} alt="Package" />
        <h1>Organisation not found</h1>
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

  // ✅ Fetch all reviews related to this organisation
  const allReviews = await database.query.reviews.findMany({
    with: {
      reviewer: true,
      organisation: true,
    },
  });

  const userReviews = allReviews.filter(
    (review) => review.organisationId === organisation.id,
  );

  // ✅ Only show button if the viewed organisation is a carrier
  const canAssignCarrier = organisation.chainOfCustody === "wasteCarrier";

  const imageSrc =
    typeof organisation.profilePicture === "string"
      ? getImageUrl(organisation.profilePicture)
      : "/placeholder-company.png";

  console.log("🏢 Viewing organisation:", organisation.teamName);
  console.log("🔗 Chain of custody:", organisation.chainOfCustody);
  console.log("✅ canAssignCarrier:", canAssignCarrier);

  return (
    <main className="pl-[22vw] space-y-8 py-36 px-12">
      <div className="grid grid-cols-6 gap-6">
        {/* Main Info Column */}
        <div className="col-span-4 flex flex-col gap-6">
          {/* Organisation Header */}
          <div className="flex items-center justify-around gap-x-6">
            <Image
              height={100}
              width={100}
              src={imageSrc}
              alt={`${organisation.teamName} logo`}
              className="w-32 h-32 rounded-full object-cover"
            />

            <div>
              <h1 className="font-semibold text-2xl">
                {organisation.teamName}
              </h1>
              <h2 className="font-semibold text-lg text-gray-600">
                {organisation.region}, {organisation.country}
              </h2>
            </div>

            {/* ✅ Only visible if the viewed organisation is a carrier */}
            {canAssignCarrier && (
              <AssignCarrierModal carrierOrgId={organisation.id} />
            )}
          </div>

          {/* Reviews Section */}
          <section className="p-6 bg-gray-100 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
            {userReviews.length > 0 ? (
              <ul className="grid grid-cols-2 gap-4">
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
                    <p className="mt-2">“{review.reviewText}”</p>
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

        {/* Sidebar Column */}
        <div className="col-span-2 space-y-4 p-6 rounded-lg bg-gray-100">
          <h2 className="text-2xl font-semibold mb-2">Company Details</h2>

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
          <p className="text-sm text-gray-500">
            <strong>Chain of Custody:</strong> {organisation.chainOfCustody}
          </p>
        </div>
      </div>
    </main>
  );
}
