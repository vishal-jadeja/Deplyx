ALTER TABLE "github_installations" ADD COLUMN "removed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "repositories" ADD COLUMN "removed_at" timestamp with time zone;