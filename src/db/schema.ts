import {
  integer,
  pgTable,
  primaryKey,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";
import { relations } from "drizzle-orm";

// Users
export const users = pgTable("bb_user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()), // Use UUID for user IDs
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
  confirmPassword: text("confirmPassword"),
  role: text("role").default("wasteManager"),
});

//Reset Password Tokens
export const passwordResetTokens = pgTable("bb_passwordResetToken", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()), // Generate UUID as default
  token: text("token").notNull(), // Reset token
  email: text("email").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(), // Expiration timestamp
  used: boolean("used").notNull().default(false), // Token usage status
});

// Accounts
export const accounts = pgTable(
  "bb_account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }), // Foreign key to users
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
    }), // Composite primary key for provider and providerAccountId
  })
);

// Sessions
export const sessions = pgTable("bb_session", {
  sessionToken: text("sessionToken").primaryKey(), // Session token as primary key
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // Foreign key to users
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// Verification Tokens
export const verificationTokens = pgTable(
  "bb_verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }), // Composite key
  })
);

// Items
export const items = pgTable("bb_item", {
  id: integer("id").primaryKey(), // Changed from serial to integer
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
  archived: boolean("archived").notNull().default(false),
  offerAccepted: boolean("offerAccepted").notNull().default(false),
  assigned: boolean("assigned").notNull().default(false),
  completed: boolean("completed").notNull().default(false),
  winningBidId: integer("winningBidId")
    .references(() => bids.id, { onDelete: "set null" })
    .default(null),
});

// Bids
export const bids = pgTable("bb_bids", {
  id: integer("id").primaryKey(), // Changed from serial to integer
  amount: integer("amount").notNull(),
  companyName: text("companyName").notNull(),
  emailAddress: text("emailAddress").notNull(),
  itemName: text("itemName").notNull(),
  itemId: integer("itemId")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }), // Foreign key to items
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // Foreign key to users
  profileId: integer("profileId")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }), // Foreign key to profiles
  timestamp: timestamp("timestamp", { mode: "date" }).notNull(),
  declinedOffer: boolean("declinedOffer").notNull().default(false),
  cancelledJob: boolean("cancelledJob").notNull().default(false),
  cancellationReason: text("cancellationReason"),
});

// Profiles
export const profiles = pgTable("bb_profile", {
  id: integer("id").primaryKey(), // Changed from serial to integer
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // Foreign key to users
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
  wasteManagementNeeds: text("wasteManagementNeeds"),
  wasteType: text("wasteType"),
  servicesOffered: text("servicesOffered"),
  environmentalPolicy: text("environmentalPolicy"),
  certifications: text("certifications"),
});

// Reviews
export const reviews = pgTable("bb_review", {
  id: integer("id").primaryKey(), // Changed from serial to integer
  reviewerId: text("reviewerId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // Foreign key to users who leave reviews
  profileId: integer("profileId")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }), // Foreign key to profiles being reviewed
  rating: integer("rating").notNull(), // Rating, e.g., from 1 to 5
  reviewText: text("reviewText").notNull(), // The review content
  timestamp: timestamp("timestamp", { mode: "date" }).notNull().defaultNow(), // Timestamp for when the review is created
});

//Notifications
export const notifications = pgTable("bb_notifications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  receiverId: text("receiverId").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  url: text("url").notNull(),
  isRead: boolean("isRead").notNull().default(false),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

// Define relationships for notifications
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.receiverId],
    references: [users.id],
  }),
}));

// Define relationships for bids
export const bidsRelations = relations(bids, ({ one }) => ({
  user: one(users, {
    fields: [bids.userId],
    references: [users.id],
  }),
  item: one(items, {
    fields: [bids.itemId],
    references: [items.id],
  }),
}));

// Define relationships for reviews
export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
  }),
  profile: one(profiles, {
    fields: [reviews.profileId],
    references: [profiles.id],
  }),
}));

// Define relationships for profiles
export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  reviews: many(reviews, {
    fields: [reviews.profileId],
    references: [profiles.id],
  }),
}));

// Define relationships for items
export const itemsRelations = relations(items, ({ one }) => ({
  user: one(users, {
    fields: [items.userId],
    references: [users.id],
  }),
  // Correct the relationship to fetch only the bid that matches the `winningBidId`
  winningBid: one(bids, {
    fields: [items.winningBidId], // Use `winningBidId` from `items` table
    references: [bids.id], // Referencing the primary key `id` in the `bids` table
  }),
}));

// Type for selecting item rows
export type Item = typeof items.$inferSelect;
