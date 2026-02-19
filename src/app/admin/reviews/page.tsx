import { requirePlatformAdmin } from "@/lib/adminGuard";
import { getReviewDashboard } from "./actions";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams?: { search?: string };
}) {
  await requirePlatformAdmin();

  const search = searchParams?.search;
  const { reviews, stats } = await getReviewDashboard(search);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Reviews & Reputation</h1>
        <p className="text-sm text-gray-500">
          Platform trust monitoring & moderation
        </p>
      </div>

      {/* KPI STRIP */}
      <div className="grid grid-cols-3 gap-6">
        <StatCard label="Total Reviews" value={stats.total} />
        <StatCard
          label="Average Rating"
          value={Number(stats.average).toFixed(2)}
        />
        <StatCard label="This Week" value={stats.thisWeek} />
      </div>

      {/* RATING BREAKDOWN */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="font-semibold">Rating Distribution</h2>
        {[5, 4, 3, 2, 1].map((star) => {
          const item = stats.breakdown.find((r) => r.rating === star);
          const count = item?.count ?? 0;
          const percentage =
            stats.total === 0 ? 0 : (count / stats.total) * 100;

          return (
            <div key={star} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{star} ⭐</span>
                <span>{count}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded">
                <div
                  className="h-2 bg-black rounded"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* SEARCH */}
      <form className="flex gap-2">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search by user, organisation, or comment..."
          className="border px-4 py-2 rounded w-96 text-sm"
        />
        <button className="px-4 py-2 bg-black text-white rounded text-sm">
          Search
        </button>
      </form>

      <div className="text-sm text-gray-600">
        {search ? (
          <>
            Showing <strong>{reviews.length}</strong> result
            {reviews.length !== 1 && "s"} for "<strong>{search}</strong>"
            <a
              href="/admin/reviews"
              className="ml-4 text-blue-600 hover:underline"
            >
              Clear search
            </a>
          </>
        ) : (
          <>
            Showing <strong>{reviews.length}</strong> total reviews
          </>
        )}
      </div>

      {/* REVIEW FEED */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white p-10 rounded-lg shadow text-center">
            <p className="text-lg font-medium">No reviews found</p>
            <p className="text-sm text-gray-500 mt-2">
              {search
                ? `No reviews matched "${search}".`
                : "There are no reviews in the system yet."}
            </p>

            {search && (
              <a
                href="/admin/reviews"
                className="inline-block mt-4 px-4 py-2 bg-black text-white rounded text-sm"
              >
                Clear Search
              </a>
            )}
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className={`p-5 rounded-lg shadow border ${
                review.rating <= 2 ? "bg-red-50 border-red-200" : "bg-white"
              }`}
            >
              <div className="flex justify-between">
                <div className="text-sm font-medium">
                  {review.organisationName}
                </div>
                <div className="text-sm">{review.rating} ⭐</div>
              </div>

              <p className="text-sm text-gray-600 mt-2">
                {review.comment ?? "No comment provided."}
              </p>

              <div className="text-xs text-gray-500 mt-3 flex justify-between">
                <span>
                  By {review.reviewerName} ({review.reviewerEmail})
                </span>
                <span>
                  {review.createdAt
                    ? new Date(review.createdAt).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
