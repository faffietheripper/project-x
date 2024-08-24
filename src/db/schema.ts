import {
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

export const users = pgTable("bb_user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
  confirmPassword: text("confirmPassword"),
});

import { relations } from "drizzle-orm";

export const accounts = pgTable(
  "bb_account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("bb_session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "bb_verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const bids = pgTable("bb_bids", {
  id: serial("id").primaryKey(),
  amount: integer("amount").notNull(),
  companyName: text("name").notNull(),
  emailAddress: text("emailAddress").notNull(),
  itemName: text("itemName").notNull(),
  itemId: serial("itemId")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  profileId: serial("profileId")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp", { mode: "date" }).notNull(),
});

export const items = pgTable("bb_item", {
  id: serial("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  startingPrice: integer("startingPrice").notNull().default(0),
  fileKey: text("fileKey").notNull(),
  currentBid: integer("currentBid").notNull().default(0),
  endDate: timestamp("endDate", { mode: "date" }).notNull(),
  transactionConditions: text("transactionConditions").notNull(),
  transportationDetails: text("transportationDetails").notNull(),
  complianceDetails: text("complianceDetails").notNull(),
  detailedDescription: text("detailedDescription").notNull(),
  location: text("location").notNull(),
});

export const profiles = pgTable("bb_profile", {
  id: serial("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  profilePicture: text("profilePicture"),
  companyName: text("companyName").notNull(),
  companyOverview: text("companyOverview"),
  telephone: text("telephone").notNull(),
  emailAddress: text("emailAddress").notNull(),
  country: text("country").notNull(),
  streetAddress: text("streetAddress").notNull(),
  city: text("city").notNull(),
  region: text("region").notNull(),
  postCode: text("postCode").notNull(),
  wasteManagementMethod: text("wasteManagementMethod").notNull(),
  wasteManagementNeeds: text("wasteManagementNeeds").notNull(),
  wasteType: text("wasteType"),
  environmentalPolicy: text("environmentalPolicy"),
  certifications: text("certifications"),
});

export const bidsRelations = relations(bids, ({ one }) => ({
  user: one(users, {
    fields: [bids.userId],
    references: [users.id],
  }),
}));

// Define relationships for the profiles table
export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export type Item = typeof items.$inferSelect;
