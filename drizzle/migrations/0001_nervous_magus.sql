CREATE TABLE IF NOT EXISTS "bb_carrier_assignment" (
	"id" text PRIMARY KEY NOT NULL,
	"itemId" integer NOT NULL,
	"carrierOrganisationId" text NOT NULL,
	"assignedByOrganisationId" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"assignedAt" timestamp DEFAULT now(),
	"respondedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bb_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"receiverId" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"url" text NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bb_organisation" (
	"id" text PRIMARY KEY NOT NULL,
	"teamName" text NOT NULL,
	"profilePicture" text,
	"chainOfCustody" text,
	"industry" text,
	"createdAt" timestamp DEFAULT now(),
	"telephone" text NOT NULL,
	"emailAddress" text NOT NULL,
	"country" text NOT NULL,
	"streetAddress" text NOT NULL,
	"city" text NOT NULL,
	"region" text NOT NULL,
	"postCode" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bb_passwordResetToken" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"email" text NOT NULL,
	"expires" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bb_bids" DROP CONSTRAINT "bb_bids_profileId_bb_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "bb_review" DROP CONSTRAINT "bb_review_profileId_bb_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "bb_bids" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "bb_bids" ALTER COLUMN "companyName" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bb_bids" ALTER COLUMN "emailAddress" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bb_bids" ALTER COLUMN "itemName" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bb_item" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "bb_profile" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "bb_review" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "bb_user" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "bb_bids" ADD COLUMN "organisationId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "bb_item" ADD COLUMN "organisationId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "bb_item" ADD COLUMN "winningOrganisationId" text DEFAULT null;--> statement-breakpoint
ALTER TABLE "bb_item" ADD COLUMN "assignedCarrierOrganisationId" text DEFAULT null;--> statement-breakpoint
ALTER TABLE "bb_item" ADD COLUMN "assignedByOrganisationId" text DEFAULT null;--> statement-breakpoint
ALTER TABLE "bb_item" ADD COLUMN "assignedAt" timestamp;--> statement-breakpoint
ALTER TABLE "bb_item" ADD COLUMN "carrierStatus" text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "bb_profile" ADD COLUMN "fullName" text NOT NULL;--> statement-breakpoint
ALTER TABLE "bb_review" ADD COLUMN "organisationId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "bb_user" ADD COLUMN "organisationId" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bb_carrier_assignment" ADD CONSTRAINT "bb_carrier_assignment_itemId_bb_item_id_fk" FOREIGN KEY ("itemId") REFERENCES "public"."bb_item"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bb_carrier_assignment" ADD CONSTRAINT "bb_carrier_assignment_carrierOrganisationId_bb_organisation_id_fk" FOREIGN KEY ("carrierOrganisationId") REFERENCES "public"."bb_organisation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bb_carrier_assignment" ADD CONSTRAINT "bb_carrier_assignment_assignedByOrganisationId_bb_organisation_id_fk" FOREIGN KEY ("assignedByOrganisationId") REFERENCES "public"."bb_organisation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bb_bids" ADD CONSTRAINT "bb_bids_organisationId_bb_organisation_id_fk" FOREIGN KEY ("organisationId") REFERENCES "public"."bb_organisation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bb_item" ADD CONSTRAINT "bb_item_organisationId_bb_organisation_id_fk" FOREIGN KEY ("organisationId") REFERENCES "public"."bb_organisation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bb_item" ADD CONSTRAINT "bb_item_winningOrganisationId_bb_organisation_id_fk" FOREIGN KEY ("winningOrganisationId") REFERENCES "public"."bb_organisation"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bb_item" ADD CONSTRAINT "bb_item_assignedCarrierOrganisationId_bb_organisation_id_fk" FOREIGN KEY ("assignedCarrierOrganisationId") REFERENCES "public"."bb_organisation"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bb_item" ADD CONSTRAINT "bb_item_assignedByOrganisationId_bb_organisation_id_fk" FOREIGN KEY ("assignedByOrganisationId") REFERENCES "public"."bb_organisation"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bb_review" ADD CONSTRAINT "bb_review_organisationId_bb_organisation_id_fk" FOREIGN KEY ("organisationId") REFERENCES "public"."bb_organisation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bb_user" ADD CONSTRAINT "bb_user_organisationId_bb_organisation_id_fk" FOREIGN KEY ("organisationId") REFERENCES "public"."bb_organisation"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "bb_bids" DROP COLUMN IF EXISTS "profileId";--> statement-breakpoint
ALTER TABLE "bb_profile" DROP COLUMN IF EXISTS "companyName";--> statement-breakpoint
ALTER TABLE "bb_profile" DROP COLUMN IF EXISTS "companyOverview";--> statement-breakpoint
ALTER TABLE "bb_profile" DROP COLUMN IF EXISTS "wasteManagementMethod";--> statement-breakpoint
ALTER TABLE "bb_profile" DROP COLUMN IF EXISTS "wasteManagementNeeds";--> statement-breakpoint
ALTER TABLE "bb_profile" DROP COLUMN IF EXISTS "wasteType";--> statement-breakpoint
ALTER TABLE "bb_profile" DROP COLUMN IF EXISTS "servicesOffered";--> statement-breakpoint
ALTER TABLE "bb_profile" DROP COLUMN IF EXISTS "environmentalPolicy";--> statement-breakpoint
ALTER TABLE "bb_profile" DROP COLUMN IF EXISTS "certifications";--> statement-breakpoint
ALTER TABLE "bb_review" DROP COLUMN IF EXISTS "profileId";--> statement-breakpoint
ALTER TABLE "bb_user" ADD CONSTRAINT "bb_user_email_unique" UNIQUE("email");