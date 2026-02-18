import NextAuth, { DefaultSession, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { database } from "@/db/database";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { getUserFromDb } from "@/app/login/actions"; // Ensure this path is correct

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(database, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  callbacks: {
    async session({ session, token, user }) {
      // Attach all user properties to the session.user object
      if (token) {
        session.user = {
          ...token, // spread the token properties which should now include the full user object
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token = { ...user }; // Spread the full user object into the token
      }
      return token;
    },
  },
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials.password) {
          return null; // Required by NextAuth
        }

        const userResponse = await getUserFromDb(
          credentials.email,
          credentials.password,
        );

        if (!userResponse.success) {
          return null; // Return null on failure
        }

        // Return the user object for NextAuth session
        return {
          id: userResponse.data.id,
          name: userResponse.data.name,
          email: userResponse.data.email,
          role: userResponse.data.role,
        };
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
