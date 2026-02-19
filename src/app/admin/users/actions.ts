"use server";

import { database } from "@/db/database";
import { users, organisations, wasteListings, bids } from "@/db/schema";
import { desc, eq, ilike, or, sql } from "drizzle-orm";

/* =========================================
   GET USERS (WITH SEARCH)
========================================= */

export async function getAllPlatformUsers(search?: string) {
  const whereClause = search
    ? or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))
    : undefined;

  const results = await database
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      isSuspended: users.isSuspended,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      organisationName: organisations.teamName,

      listingsCount: sql<number>`
        (select count(*) from bb_waste_listing wl where wl."userId" = ${users.id})
      `,

      bidsCount: sql<number>`
        (select count(*) from bb_bids b where b."userId" = ${users.id})
      `,
    })
    .from(users)
    .leftJoin(organisations, eq(users.organisationId, organisations.id))
    .where(whereClause)
    .orderBy(desc(users.createdAt));

  return results;
}

/* =========================================
   SUSPEND USER
========================================= */

export async function suspendUser(userId: string) {
  await database
    .update(users)
    .set({
      isSuspended: true,
      isActive: false,
    })
    .where(eq(users.id, userId));
}

/* =========================================
   REACTIVATE USER
========================================= */

export async function reactivateUser(userId: string) {
  await database
    .update(users)
    .set({
      isSuspended: false,
      isActive: true,
    })
    .where(eq(users.id, userId));
}

/* =========================================
   GET SINGLE USER (DETAIL PAGE)
========================================= */

export async function getPlatformUserById(userId: string) {
  const [user] = await database
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      isSuspended: users.isSuspended,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      organisationName: organisations.teamName,

      listingsCount: sql<number>`
        (select count(*) from bb_waste_listing wl where wl."userId" = ${users.id})
      `,

      bidsCount: sql<number>`
        (select count(*) from bb_bids b where b."userId" = ${users.id})
      `,
    })
    .from(users)
    .leftJoin(organisations, eq(users.organisationId, organisations.id))
    .where(eq(users.id, userId));

  return user;
}
