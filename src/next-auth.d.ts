import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      organisationId: string | null;
      role: string;
      profileCompleted: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    organisationId: string | null;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    organisationId: string | null;
    role: string;
    profileCompleted: boolean;
  }
}
