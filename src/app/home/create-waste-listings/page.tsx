import Link from "next/link";
import { getOrgTemplates } from "../team-dashboard/template-library/actions";

export default async function CreateWasteListing() {
  const templates = await getOrgTemplates();

  return (
    <main className="pl-[24vw] py-14 pt-[15vh] px-12">
      <h1 className="text-3xl font-bold mb-10">Select Listing Template</h1>

      <div className="space-y-4 max-w-2xl">
        {templates
          .filter((t) => t.isLocked) // Only allow locked templates
          .map((template) => (
            <Link
              key={template.id}
              href={`/home/create-waste-listings/${template.id}`}
              className="block border p-6 rounded hover:bg-gray-50"
            >
              <div className="font-semibold text-lg">{template.name}</div>
              <div className="text-sm text-gray-500">
                Version {template.version}
              </div>
            </Link>
          ))}
      </div>
    </main>
  );
}
