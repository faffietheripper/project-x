CREATE TABLE IF NOT EXISTS "bb_account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "bb_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bb_bids" (
	"id" serial PRIMARY KEY NOT NULL,
	"amount" integer NOT NULL,
	"companyName" text NOT NULL,
	"emailAddress" text NOT NULL,
	"itemName" text NOT NULL,
	"itemId" integer NOT NULL,
	"userId" text NOT NULL,
	"profileId" integer NOT NULL,
	"timestamp" timestamp NOT NULL,
	"declinedOffer" boolean DEFAULT false NOT NULL,
	"cancelledJob" boolean DEFAULT false NOT NULL,
	"cancellationReason" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bb_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"startingPrice" integer DEFAULT 0 NOT NULL,
	"fileKey" text NOT NULL,
	"currentBid" integer DEFAULT 0 NOT NULL,
	"endDate" timestamp NOT NULL,
	"transactionConditions" text NOT NULL,
	"transportationDetails" text NOT NULL,
	"complianceDetails" text NOT NULL,
	"detailedDescription" text NOT NULL,
	"location" text NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"offerAccepted" boolean DEFAULT false NOT NULL,
	"assigned" boolean DEFAULT false NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"winningBidId" integer DEFAULT null
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bb_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"profilePicture" text,
	"companyName" text NOT NULL,
	"companyOverview" text,
	"telephone" text NOT NULL,
	"emailAddress" text NOT NULL,
	"country" text NOT NULL,
	"streetAddress" text NOT NULL,
	"city" text NOT NULL,
	"region" text NOT NULL,
	"postCode" text NOT NULL,
	"wasteManagementMethod" text NOT NULL,
	"wasteManagementNeeds" text,
	"wasteType" text,
	"servicesOffered" text,
	"environmentalPolicy" text,
	"certifications" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bb_review" (
	"id" serial PRIMARY KEY NOT NULL,
	"reviewerId" text NOT NULL,
	"profileId" integer NOT NULL,
	"rating" integer NOT NULL,
	"reviewText" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bb_session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bb_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"password" text,
	"confirmPassword" text,
	"role" text DEFAULT 'wasteManager'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bb_verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "bb_verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bb_account" ADD CONSTRAINT "bb_account_userId_bb_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."bb_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bb_bids" ADD CONSTRAINT "bb_bids_itemId_bb_item_id_fk" FOREIGN KEY ("itemId") REFERENCES "public"."bb_item"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bb_bids" ADD CONSTRAINT "bb_bids_userId_bb_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."bb_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bb_bids" ADD CONSTRAINT "bb_bids_profileId_bb_profile_id_fk" FOREIGN KEY ("profileId") REFERENCES "public"."bb_profile"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bb_item" ADD CONSTRAINT "bb_item_userId_bb_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."bb_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bb_item" ADD CONSTRAINT "bb_item_winningBidId_bb_bids_id_fk" FOREIGN KEY ("winningBidId") REFERENCES "public"."bb_bids"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bb_profile" ADD CONSTRAINT "bb_profile_userId_bb_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."bb_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bb_review" ADD CONSTRAINT "bb_review_reviewerId_bb_user_id_fk" FOREIGN KEY ("reviewerId") REFERENCES "public"."bb_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bb_review" ADD CONSTRAINT "bb_review_profileId_bb_profile_id_fk" FOREIGN KEY ("profileId") REFERENCES "public"."bb_profile"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bb_session" ADD CONSTRAINT "bb_session_userId_bb_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."bb_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

import { sql } from "drizzle-orm";

export const up = async (db) => {

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "bb_review" (
      "id" serial PRIMARY KEY NOT NULL,
      "reviewerId" text NOT NULL,
      "profileId" integer NOT NULL,
      "rating" integer NOT NULL,
      "reviewText" text NOT NULL,
      "timestamp" timestamp DEFAULT now() NOT NULL
    );
  `);


  await db.execute(sql`
    ALTER TABLE "bb_item" ALTER COLUMN "winningBidId" SET DEFAULT null;
  `);


  await db.execute(sql`
    ALTER TABLE "bb_bids" ALTER COLUMN "itemId" TYPE integer USING "itemId"::integer;
  `);
  await db.execute(sql`
    ALTER TABLE "bb_bids" ALTER COLUMN "profileId" TYPE integer USING "profileId"::integer;
  `);


  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "bb_review" ADD CONSTRAINT "bb_review_reviewerId_bb_user_id_fk"
        FOREIGN KEY ("reviewerId") REFERENCES "bb_user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "bb_review" ADD CONSTRAINT "bb_review_profileId_bb_profile_id_fk"
        FOREIGN KEY ("profileId") REFERENCES "bb_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);
};

export const down = async (db) => {

  await db.execute(sql`
    ALTER TABLE "bb_bids" ALTER COLUMN "itemId" TYPE serial;
  `);
  await db.execute(sql`
    ALTER TABLE "bb_bids" ALTER COLUMN "profileId" TYPE serial;
  `);
  await db.execute(sql`
    ALTER TABLE "bb_item" ALTER COLUMN "winningBidId" DROP DEFAULT;
  `);
  await db.execute(sql`
    ALTER TABLE "bb_review" DROP CONSTRAINT IF EXISTS "bb_review_reviewerId_bb_user_id_fk";
  `);
  await db.execute(sql`
    ALTER TABLE "bb_review" DROP CONSTRAINT IF EXISTS "bb_review_profileId_bb_profile_id_fk";
  `);
};
