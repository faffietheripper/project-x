import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { database } from "@/db/database";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
  userProfiles,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserFromDb } from "@/app/login/actions";

/* ===============================
   Extend Session + JWT Types
================================= */

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

/* ===============================
   NextAuth Config
================================= */

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(database, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    /* ===============================
       JWT Callback
       Runs at login + on refresh
    ================================= */
    async jwt({ token, user }) {
      // On initial login
      if (user) {
        const dbUser = await database.query.users.findFirst({
          where: eq(users.id, user.id),
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.organisationId = dbUser.organisationId;
          token.role = dbUser.role;

          const profile = await database.query.userProfiles.findFirst({
            where: eq(userProfiles.userId, dbUser.id),
          });

          token.profileCompleted = !!profile;
        }
      }

      return token;
    },

    /* ===============================
       Session Callback
       Controls what client receives
    ================================= */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.organisationId = token.organisationId;
        session.user.role = token.role;
        session.user.profileCompleted = token.profileCompleted;
      }

      return session;
    },
  },

  providers: [
    Google,

    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const userResponse = await getUserFromDb(
          credentials.email,
          credentials.password,
        );

        if (!userResponse.success) {
          return null;
        }

        // Only return minimal required fields
        return {
          id: userResponse.data.id,
          name: userResponse.data.name,
          email: userResponse.data.email,
        };
      },
    }),
  ],

  secret: process.env.AUTH_SECRET,
});
