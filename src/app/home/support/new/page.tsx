import { auth } from "@/auth";
import { database } from "@/db/database";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import CreateTicketForm from "@/components/app/Support/CreateTicketForm";

export default async function NewTicketPage() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const dbUser = await database.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!dbUser?.organisationId) {
    return <div className="p-8">No organisation found.</div>;
  }

  return (
    <main className="pl-[22vw] pt-36 p-12 space-y-8">
      <h1 className="text-3xl font-bold">Create Support Ticket</h1>

      <CreateTicketForm organisationId={dbUser.organisationId} />
    </main>
  );
}
