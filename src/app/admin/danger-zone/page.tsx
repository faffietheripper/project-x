import { requirePlatformAdmin } from "@/lib/access/require-platform-admin";
import {
  suspendOrganisation,
  cancelListing,
  resolveIncident,
  resetUserAccount,
} from "./actions";

export default async function DangerZonePage() {
  await requirePlatformAdmin();

  return (
    <div className="space-y-10 max-w-3xl">
      <h1 className="text-2xl font-bold text-red-600">Danger Zone</h1>

      <p className="text-sm text-gray-500">
        Administrative tools for resolving critical platform issues.
      </p>

      {/* Suspend Organisation */}

      <section className="bg-white p-6 rounded shadow space-y-3">
        <h2 className="font-semibold">Suspend Organisation</h2>

        <form action={suspendOrganisation}>
          <input
            name="organisationId"
            placeholder="Organisation ID"
            className="border p-2 w-full rounded"
          />

          <button className="mt-3 bg-red-600 text-white px-4 py-2 rounded">
            Suspend Organisation
          </button>
        </form>
      </section>

      {/* Cancel Listing */}

      <section className="bg-white p-6 rounded shadow space-y-3">
        <h2 className="font-semibold">Cancel Listing</h2>

        <form action={cancelListing}>
          <input
            name="listingId"
            placeholder="Listing ID"
            className="border p-2 w-full rounded"
          />

          <button className="mt-3 bg-red-600 text-white px-4 py-2 rounded">
            Cancel Listing
          </button>
        </form>
      </section>

      {/* Resolve Incident */}

      <section className="bg-white p-6 rounded shadow space-y-3">
        <h2 className="font-semibold">Resolve Incident</h2>

        <form action={resolveIncident}>
          <input
            name="incidentId"
            placeholder="Incident ID"
            className="border p-2 w-full rounded"
          />

          <button className="mt-3 bg-red-600 text-white px-4 py-2 rounded">
            Resolve Incident
          </button>
        </form>
      </section>

      {/* Reset User */}

      <section className="bg-white p-6 rounded shadow space-y-3">
        <h2 className="font-semibold">Reset User Account</h2>

        <form action={resetUserAccount}>
          <input
            name="userId"
            placeholder="User ID"
            className="border p-2 w-full rounded"
          />

          <button className="mt-3 bg-red-600 text-white px-4 py-2 rounded">
            Reset User
          </button>
        </form>
      </section>
    </div>
  );
}
