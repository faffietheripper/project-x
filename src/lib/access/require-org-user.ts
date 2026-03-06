import { auth } from "@/auth";

export async function requireOrgUser() {
  const session = await auth();

  if (!session?.user?.id || !session.user.organisationId) {
    throw new Error("Unauthorized");
  }

  return {
    userId: session.user.id,
    organisationId: session.user.organisationId,
    role: session.user.role,
  };
}
