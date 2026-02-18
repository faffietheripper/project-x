import {
  integer,
  pgTable,
  primaryKey,
  text,
  boolean,
  timestamp,
  serial,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";
import { relations } from "drizzle-orm";

/* =========================================================
   ORGANISATIONS
========================================================= */

export const organisations = pgTable("bb_organisation", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  teamName: text("teamName").notNull(),
  profilePicture: text("profilePicture"),
  chainOfCustody: text("chainOfCustody"),
  industry: text("industry"),

  telephone: text("telephone").notNull(),
  emailAddress: text("emailAddress").notNull(),
  country: text("country").notNull(),
  streetAddress: text("streetAddress").notNull(),
  city: text("city").notNull(),
  region: text("region").notNull(),
  postCode: text("postCode").notNull(),

  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

/* =========================================================
   USERS
========================================================= */

export const users = pgTable(
  "bb_user",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),

    passwordHash: text("passwordHash"),

    organisationId: text("organisationId").references(() => organisations.id, {
      onDelete: "cascade",
    }),

    role: text("role")
      .$type<
        "administrator" | "employee" | "seniorManagement" | "platform_admin"
      >()
      .notNull()
      .default("employee"),

    isActive: boolean("isActive").notNull().default(true),
    isSuspended: boolean("isSuspended").notNull().default(false),

    lastLoginAt: timestamp("lastLoginAt", { mode: "date" }),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex("user_email_unique").on(table.email),
    orgIdx: index("user_org_idx").on(table.organisationId),
    roleIdx: index("user_role_idx").on(table.role),
  }),
);

/* =========================================================
   PASSWORD RESET TOKENS
========================================================= */

export const passwordResetTokens = pgTable(
  "bb_passwordResetToken",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    token: text("token").notNull(),
    email: text("email").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
    used: boolean("used").notNull().default(false),
  },
  (table) => ({
    tokenIdx: uniqueIndex("password_token_unique").on(table.token),
  }),
);

/* =========================================================
   NEXTAUTH TABLES
========================================================= */

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
  }),
);

/* =========================================================
   ITEMS (WASTE JOBS)
========================================================= */

export const items = pgTable(
  "bb_item",
  {
    id: serial("id").primaryKey(),

    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    organisationId: text("organisationId")
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),

    winningBidId: integer("winningBidId").references(() => bids.id, {
      onDelete: "set null",
    }),

    winningOrganisationId: text("winningOrganisationId").references(
      () => organisations.id,
      { onDelete: "set null" },
    ),

    assignedCarrierOrganisationId: text(
      "assignedCarrierOrganisationId",
    ).references(() => organisations.id, { onDelete: "set null" }),

    assignedByOrganisationId: text("assignedByOrganisationId").references(
      () => organisations.id,
      { onDelete: "set null" },
    ),

    assignedAt: timestamp("assignedAt", { mode: "date" }),

    name: text("name").notNull(),
    startingPrice: integer("startingPrice").notNull().default(0),
    currentBid: integer("currentBid").notNull().default(0),

    fileKey: text("fileKey").notNull(),
    endDate: timestamp("endDate", { mode: "date" }).notNull(),

    transactionConditions: text("transactionConditions").notNull(),
    transportationDetails: text("transportationDetails").notNull(),
    complianceDetails: text("complianceDetails").notNull(),
    detailedDescription: text("detailedDescription").notNull(),
    location: text("location").notNull(),

    archived: boolean("archived").notNull().default(false),
    offerAccepted: boolean("offerAccepted").notNull().default(false),
    assigned: boolean("assigned").notNull().default(false),

    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    orgIdx: index("item_org_idx").on(table.organisationId),
    userIdx: index("item_user_idx").on(table.userId),
    archivedIdx: index("item_archived_idx").on(table.archived),
  }),
);

/* =========================================================
   BIDS
========================================================= */

export const bids = pgTable(
  "bb_bids",
  {
    id: serial("id").primaryKey(),

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

    timestamp: timestamp("timestamp", { mode: "date" }).notNull().defaultNow(),

    declinedOffer: boolean("declinedOffer").notNull().default(false),
    cancelledJob: boolean("cancelledJob").notNull().default(false),
    cancellationReason: text("cancellationReason"),
  },
  (table) => ({
    itemIdx: index("bid_item_idx").on(table.itemId),
    orgIdx: index("bid_org_idx").on(table.organisationId),
  }),
);

/* =========================================================
   CARRIER ASSIGNMENTS
========================================================= */

export const carrierAssignments = pgTable(
  "bb_carrier_assignment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    itemId: integer("itemId")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),

    carrierOrganisationId: text("carrierOrganisationId")
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),

    assignedByOrganisationId: text("assignedByOrganisationId")
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),

    status: text("status")
      .$type<"pending" | "accepted" | "rejected" | "completed">()
      .notNull()
      .default("pending"),

    verificationCode: text("verificationCode"),
    codeGeneratedAt: timestamp("codeGeneratedAt", { mode: "date" }),
    codeUsedAt: timestamp("codeUsedAt", { mode: "date" }),

    assignedAt: timestamp("assignedAt", { mode: "date" }).defaultNow(),
    respondedAt: timestamp("respondedAt", { mode: "date" }),
    collectedAt: timestamp("collectedAt", { mode: "date" }),
    completedAt: timestamp("completedAt", { mode: "date" }),
  },
  (table) => ({
    itemIdx: index("carrier_item_idx").on(table.itemId),
    carrierIdx: index("carrier_org_idx").on(table.carrierOrganisationId),
  }),
);

/* =========================================================
   REVIEWS
========================================================= */

export const reviews = pgTable(
  "bb_review",
  {
    id: serial("id").primaryKey(),

    reviewerId: text("reviewerId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    organisationId: text("organisationId")
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),

    rating: integer("rating").notNull(),
    reviewText: text("reviewText").notNull(),

    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => ({
    orgIdx: index("review_org_idx").on(table.organisationId),
    reviewerIdx: index("review_user_idx").on(table.reviewerId),
  }),
);

/* =========================================================
   INCIDENTS
========================================================= */

export const incidents = pgTable(
  "bb_incident",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    assignmentId: text("assignmentId")
      .notNull()
      .references(() => carrierAssignments.id, { onDelete: "cascade" }),

    itemId: integer("itemId")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),

    reportedByUserId: text("reportedByUserId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    reportedByOrganisationId: text("reportedByOrganisationId")
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),

    type: text("type").notNull(),
    description: text("description").notNull(),

    status: text("status")
      .$type<"open" | "under_review" | "resolved" | "rejected">()
      .notNull()
      .default("open"),

    resolutionNotes: text("resolutionNotes"),

    resolvedByUserId: text("resolvedByUserId").references(() => users.id),

    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
    resolvedAt: timestamp("resolvedAt", { mode: "date" }),
  },
  (table) => ({
    statusIdx: index("incident_status_idx").on(table.status),
    assignmentIdx: index("incident_assignment_idx").on(table.assignmentId),
  }),
);

/* =========================================================
   NOTIFICATIONS
========================================================= */

export const notifications = pgTable(
  "bb_notifications",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    receiverId: text("receiverId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    message: text("message").notNull(),
    url: text("url").notNull(),

    isRead: boolean("isRead").notNull().default(false),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    receiverIdx: index("notification_receiver_idx").on(table.receiverId),
  }),
);

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
