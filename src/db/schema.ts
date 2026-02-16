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

// Organisations
export const organisations = pgTable("bb_organisation", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  teamName: text("teamName").notNull(),
  profilePicture: text("profilePicture"),
  chainOfCustody: text("chainOfCustody"),
  industry: text("industry"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  telephone: text("telephone").notNull(),
  emailAddress: text("emailAddress").notNull(),
  country: text("country").notNull(),
  streetAddress: text("streetAddress").notNull(),
  city: text("city").notNull(),
  region: text("region").notNull(),
  postCode: text("postCode").notNull(),
});

// Users
export const users = pgTable("bb_user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
  confirmPassword: text("confirmPassword"),
  organisationId: text("organisationId").references(() => organisations.id, {
    onDelete: "cascade",
  }),
  role: text("role"),
});

// Password Reset Tokens
export const passwordResetTokens = pgTable("bb_passwordResetToken", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  token: text("token").notNull(),
  email: text("email").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
  used: boolean("used").notNull().default(false),
});

// Accounts
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
  }),
);

// Sessions
export const sessions = pgTable("bb_session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
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
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

// Bids
export const bids = pgTable("bb_bids", {
  id: integer("id").primaryKey(),
  amount: integer("amount").notNull(),
  itemId: integer("itemId")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  organisationId: text("organisationId")
    .notNull()
    .references(() => organisations.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp", { mode: "date" }).notNull(),
  declinedOffer: boolean("declinedOffer").notNull().default(false),
  cancelledJob: boolean("cancelledJob").notNull().default(false),
  cancellationReason: text("cancellationReason"),
  companyName: text("companyName"),
  emailAddress: text("emailAddress"),
  itemName: text("itemName"),
});

// Items
export const items = pgTable("bb_item", {
  id: integer("id").primaryKey(),

  // Owner (usually waste generator)
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  organisationId: text("organisationId")
    .notNull()
    .references(() => organisations.id, { onDelete: "cascade" }),

  // Waste Manager Info
  winningBidId: integer("winningBidId")
    .references(() => bids.id, { onDelete: "set null" })
    .default(null),

  winningOrganisationId: text("winningOrganisationId")
    .references(() => organisations.id, { onDelete: "set null" })
    .default(null),

  // Carrier Info (NEW)
  assignedCarrierOrganisationId: text("assignedCarrierOrganisationId")
    .references(() => organisations.id, { onDelete: "set null" })
    .default(null),

  assignedByOrganisationId: text("assignedByOrganisationId")
    .references(() => organisations.id, { onDelete: "set null" })
    .default(null),

  assignedAt: timestamp("assignedAt", { mode: "date" }),
  carrierStatus: text("carrierStatus").default("pending"), // pending | accepted | rejected | completed

  // Job Metadata
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
});

// Profiles
export const profiles = pgTable("bb_profile", {
  id: integer("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  profilePicture: text("profilePicture"),
  fullName: text("fullName").notNull(),
  telephone: text("telephone").notNull(),
  emailAddress: text("emailAddress").notNull(),
  country: text("country").notNull(),
  streetAddress: text("streetAddress").notNull(),
  city: text("city").notNull(),
  region: text("region").notNull(),
  postCode: text("postCode").notNull(),
});

// Reviews
export const reviews = pgTable("bb_review", {
  id: integer("id").primaryKey(),
  reviewerId: text("reviewerId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  organisationId: text("organisationId")
    .notNull()
    .references(() => organisations.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  reviewText: text("reviewText").notNull(),
  timestamp: timestamp("timestamp", { mode: "date" }).notNull().defaultNow(),
});

// Notifications
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

// Carrier Assignments
export const carrierAssignments = pgTable("bb_carrier_assignment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  // 🧾 Job being collected
  itemId: integer("itemId")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),

  // 🚚 Carrier doing the job
  carrierOrganisationId: text("carrierOrganisationId")
    .notNull()
    .references(() => organisations.id, { onDelete: "cascade" }),

  // 🧑‍💼 Who assigned the carrier
  assignedByOrganisationId: text("assignedByOrganisationId")
    .notNull()
    .references(() => organisations.id, { onDelete: "cascade" }),

  status: text("status").notNull().default("pending"),

  // 🕒 Timeline
  assignedAt: timestamp("assignedAt", { mode: "date" }).defaultNow(),
  respondedAt: timestamp("respondedAt", { mode: "date" }),
  collectedAt: timestamp("collectedAt", { mode: "date" }),
  completedAt: timestamp("completedAt", { mode: "date" }),

  /**
   * 🔐 Verification code
   *
   * 6-digit numeric code
   * Generated when carrier ACCEPTS the job
   * Used for:
   *  - carrier collection confirmation
   *  - manager completion confirmation
   */
  verificationCode: text("verificationCode"),
  codeGeneratedAt: timestamp("codeGeneratedAt", { mode: "date" }),

  // Optional: prevent reuse / audit
  codeUsedAt: timestamp("codeUsedAt", { mode: "date" }),
});

// Incidents
export const incidents = pgTable("bb_incident", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  /**
   * 🔗 Link to the carrier assignment
   * Incidents are tied to the movement of waste,
   * not directly to bidding.
   */
  assignmentId: text("assignmentId")
    .notNull()
    .references(() => carrierAssignments.id, { onDelete: "cascade" }),

  /**
   * 🔗 Redundant reference to item
   * Makes dashboard queries & analytics easier.
   */
  itemId: integer("itemId")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),

  /**
   * 👤 User who submitted the incident
   */
  reportedByUserId: text("reportedByUserId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  /**
   * 🏢 Organisation that reported it (carrier)
   */
  reportedByOrganisationId: text("reportedByOrganisationId")
    .notNull()
    .references(() => organisations.id, { onDelete: "cascade" }),

  /**
   * 📂 Structured type
   */
  type: text("type").notNull(),

  /**
   * 📝 Detailed explanation
   */
  description: text("description").notNull(),

  /**
   * 📊 Lifecycle
   *
   * open → carrier submitted
   * under_review → manager reviewing
   * resolved → accepted & handled
   * rejected → manager rejected claim
   */
  status: text("status")
    .$type<"open" | "under_review" | "resolved" | "rejected">()
    .notNull()
    .default("open"),

  /**
   * 🧾 Manager/admin resolution notes
   */
  resolutionNotes: text("resolutionNotes"),

  /**
   * 🕒 Timeline
   */
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),

  resolvedAt: timestamp("resolvedAt", { mode: "date" }),
});

// RELATIONS
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.receiverId],
    references: [users.id],
  }),
}));

export const bidsRelations = relations(bids, ({ one }) => ({
  user: one(users, {
    fields: [bids.userId],
    references: [users.id],
  }),
  item: one(items, {
    fields: [bids.itemId],
    references: [items.id],
  }),
  organisation: one(organisations, {
    fields: [bids.organisationId],
    references: [organisations.id],
  }),
}));

export const carrierAssignmentsRelations = relations(
  carrierAssignments,
  ({ one, many }) => ({
    item: one(items, {
      fields: [carrierAssignments.itemId],
      references: [items.id],
    }),

    carrierOrganisation: one(organisations, {
      relationName: "carrierOrganisation",
      fields: [carrierAssignments.carrierOrganisationId],
      references: [organisations.id],
    }),

    assignedByOrganisation: one(organisations, {
      relationName: "assignedByOrganisation",
      fields: [carrierAssignments.assignedByOrganisationId],
      references: [organisations.id],
    }),

    incidents: many(incidents, {
      fields: [carrierAssignments.id],
      references: [incidents.assignmentId],
    }),
  }),
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
  }),
  organisation: one(organisations, {
    fields: [reviews.organisationId],
    references: [organisations.id],
  }),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  user: one(users, { fields: [items.userId], references: [users.id] }),

  organisation: one(organisations, {
    relationName: "ownerOrganisation",
    fields: [items.organisationId],
    references: [organisations.id],
  }),

  winningOrganisation: one(organisations, {
    relationName: "winningOrganisation",
    fields: [items.winningOrganisationId],
    references: [organisations.id],
  }),

  assignedCarrierOrganisation: one(organisations, {
    relationName: "assignedCarrierOrganisation",
    fields: [items.assignedCarrierOrganisationId],
    references: [organisations.id],
  }),

  assignedByOrganisation: one(organisations, {
    relationName: "assignedByOrganisation",
    fields: [items.assignedByOrganisationId],
    references: [organisations.id],
  }),

  winningBid: one(bids, {
    fields: [items.winningBidId],
    references: [bids.id],
  }),

  carrierAssignments: many(carrierAssignments),
}));

export const usersRelations = relations(users, ({ one }) => ({
  organisation: one(organisations, {
    fields: [users.organisationId],
    references: [organisations.id],
  }),
}));

export const organisationsRelations = relations(organisations, ({ many }) => ({
  members: many(users),
  reviews: many(reviews),
  items: many(items, { relationName: "ownerOrganisation" }),
  winningItems: many(items, { relationName: "winningOrganisation" }),
  bids: many(bids),

  carrierJobs: many(carrierAssignments, {
    relationName: "carrierOrganisation",
  }),

  assignedCarrierJobs: many(carrierAssignments, {
    relationName: "assignedByOrganisation",
  }),
}));

export const incidentsRelations = relations(incidents, ({ one }) => ({
  assignment: one(carrierAssignments, {
    fields: [incidents.assignmentId],
    references: [carrierAssignments.id],
  }),

  item: one(items, {
    fields: [incidents.itemId],
    references: [items.id],
  }),

  reportedByUser: one(users, {
    fields: [incidents.reportedByUserId],
    references: [users.id],
  }),

  reportedByOrganisation: one(organisations, {
    fields: [incidents.reportedByOrganisationId],
    references: [organisations.id],
  }),
}));
