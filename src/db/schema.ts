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
   USER PROFILES
========================================================= */

export const userProfiles = pgTable(
  "bb_user_profile",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    profilePicture: text("profilePicture"),

    fullName: text("fullName").notNull(),
    telephone: text("telephone"),
    emailAddress: text("emailAddress"),

    country: text("country"),
    streetAddress: text("streetAddress"),
    city: text("city"),
    region: text("region"),
    postCode: text("postCode"),

    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    userUnique: uniqueIndex("user_profile_unique").on(table.userId),
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
   WASTE LISTINGS (RENAMED FROM ITEMS)
========================================================= */

export const wasteListings = pgTable(
  "bb_waste_listing",
  {
    id: serial("id").primaryKey(),

    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    organisationId: text("organisationId")
      .notNull()
      .references(() => organisations.id, { onDelete: "cascade" }),

    winningBidId: integer("winningBidId"),

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
    orgIdx: index("listing_org_idx").on(table.organisationId),
    userIdx: index("listing_user_idx").on(table.userId),
    archivedIdx: index("listing_archived_idx").on(table.archived),
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

    listingId: integer("listingId")
      .notNull()
      .references(() => wasteListings.id, { onDelete: "cascade" }),

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
    listingIdx: index("bid_listing_idx").on(table.listingId),
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

    listingId: integer("listingId")
      .notNull()
      .references(() => wasteListings.id, { onDelete: "cascade" }),

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
    listingIdx: index("carrier_listing_idx").on(table.listingId),
    carrierIdx: index("carrier_org_idx").on(table.carrierOrganisationId),
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

    listingId: integer("listingId")
      .notNull()
      .references(() => wasteListings.id, { onDelete: "cascade" }),

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

export const notifications = pgTable("bb_notification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  recipientId: text("recipientId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  actorId: text("actorId").references(() => users.id, { onDelete: "set null" }),

  listingId: text("listingId").references(() => wasteListings.id, {
    onDelete: "cascade",
  }),

  type: text("type").notNull(), // e.g. "NEW_OFFER", "NEW_REVIEW", etc

  title: text("title").notNull(),
  message: text("message").notNull(),

  isRead: boolean("isRead").notNull().default(false),

  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

export const reviews = pgTable("bb_review", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  reviewerId: text("reviewerId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  reviewedOrganisationId: text("reviewedOrganisationId")
    .notNull()
    .references(() => organisations.id, { onDelete: "cascade" }),

  listingId: text("listingId").references(() => wasteListings.id, {
    onDelete: "set null",
  }),

  rating: integer("rating").notNull(), // 1–5
  comment: text("comment"),

  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

/* =========================================================
   RELATIONS
========================================================= */

/* ================= USERS ================= */

export const usersRelations = relations(users, ({ one, many }) => ({
  organisation: one(organisations, {
    fields: [users.organisationId],
    references: [organisations.id],
  }),

  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),

  listings: many(wasteListings),

  bids: many(bids),

  notificationsReceived: many(notifications, {
    relationName: "notificationRecipient",
  }),

  notificationsSent: many(notifications, {
    relationName: "notificationActor",
  }),

  reviewsWritten: many(reviews),
}));

/* ================= USER PROFILES ================= */

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

/* ================= ORGANISATIONS ================= */

export const organisationsRelations = relations(organisations, ({ many }) => ({
  members: many(users),

  listings: many(wasteListings, {
    relationName: "ownerOrganisation",
  }),

  bids: many(bids),

  carrierJobs: many(carrierAssignments, {
    relationName: "carrierOrganisation",
  }),

  assignedCarrierJobs: many(carrierAssignments, {
    relationName: "assignedByOrganisation",
  }),

  reviews: many(reviews),
}));

/* ================= WASTE LISTINGS ================= */

export const wasteListingsRelations = relations(
  wasteListings,
  ({ one, many }) => ({
    user: one(users, {
      fields: [wasteListings.userId],
      references: [users.id],
    }),

    organisation: one(organisations, {
      relationName: "ownerOrganisation",
      fields: [wasteListings.organisationId],
      references: [organisations.id],
    }),

    bids: many(bids),

    carrierAssignments: many(carrierAssignments),

    incidents: many(incidents),

    notifications: many(notifications),

    reviews: many(reviews),
  }),
);

/* ================= BIDS ================= */

export const bidsRelations = relations(bids, ({ one }) => ({
  listing: one(wasteListings, {
    fields: [bids.listingId],
    references: [wasteListings.id],
  }),

  user: one(users, {
    fields: [bids.userId],
    references: [users.id],
  }),

  organisation: one(organisations, {
    fields: [bids.organisationId],
    references: [organisations.id],
  }),
}));

/* ================= CARRIER ASSIGNMENTS ================= */

export const carrierAssignmentsRelations = relations(
  carrierAssignments,
  ({ one, many }) => ({
    listing: one(wasteListings, {
      fields: [carrierAssignments.listingId],
      references: [wasteListings.id],
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

    incidents: many(incidents),
  }),
);

/* ================= INCIDENTS ================= */

export const incidentsRelations = relations(incidents, ({ one }) => ({
  listing: one(wasteListings, {
    fields: [incidents.listingId],
    references: [wasteListings.id],
  }),

  assignment: one(carrierAssignments, {
    fields: [incidents.assignmentId],
    references: [carrierAssignments.id],
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

/* ================= REVIEWS ================= */

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
  }),

  reviewedOrganisation: one(organisations, {
    fields: [reviews.reviewedOrganisationId],
    references: [organisations.id],
  }),

  listing: one(wasteListings, {
    fields: [reviews.listingId],
    references: [wasteListings.id],
  }),
}));

/* ================= NOTIFICATIONS ================= */

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, {
    fields: [notifications.recipientId],
    references: [users.id],
    relationName: "notificationRecipient",
  }),

  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.id],
    relationName: "notificationActor",
  }),

  listing: one(wasteListings, {
    fields: [notifications.listingId],
    references: [wasteListings.id],
  }),
}));
