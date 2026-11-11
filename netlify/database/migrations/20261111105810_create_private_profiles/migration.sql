CREATE TABLE "profiles" (
	"user_id" text PRIMARY KEY,
	"full_name" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"currency" text DEFAULT 'KSh' NOT NULL,
	"photo_key" text,
	"hide_amounts" boolean DEFAULT false NOT NULL,
	"finances" jsonb DEFAULT '{"monthlyBudget":0,"expenses":[]}' NOT NULL
);
