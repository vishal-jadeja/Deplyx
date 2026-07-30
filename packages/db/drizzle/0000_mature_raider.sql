CREATE TYPE "public"."finding_kind" AS ENUM('ai_model', 'package');--> statement-breakpoint
CREATE TYPE "public"."fix_status" AS ENUM('detected', 'diff_generated', 'approved', 'pr_open', 'merged', 'closed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."llm_provider" AS ENUM('anthropic', 'openai', 'groq', 'google');--> statement-breakpoint
CREATE TYPE "public"."risk_class" AS ENUM('low_risk_swap', 'high_risk_rewrite');--> statement-breakpoint
CREATE TYPE "public"."scan_status" AS ENUM('queued', 'running', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TABLE "accounts" (
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "accounts" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sessions" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "verification_tokens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "verification_tokens" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"repository_id" uuid NOT NULL,
	"scan_id" uuid,
	"kind" "finding_kind" NOT NULL,
	"file_path" text NOT NULL,
	"line" integer NOT NULL,
	"column_number" integer NOT NULL,
	"matched_value" text NOT NULL,
	"severity" "severity" NOT NULL,
	"enclosing_symbol" text,
	"context_start_line" integer,
	"context_end_line" integer,
	"context_code" text,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	CONSTRAINT "findings_unique_match" UNIQUE("repository_id","file_path","line","matched_value","kind")
);
--> statement-breakpoint
ALTER TABLE "findings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "findings" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "fixes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"finding_id" uuid NOT NULL,
	"status" "fix_status" DEFAULT 'detected' NOT NULL,
	"risk_class" "risk_class",
	"chosen_replacement" text,
	"diff" text,
	"reasoning" text,
	"confidence" text,
	"confidence_reasons" text[],
	"pr_number" integer,
	"pr_url" text,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fixes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "fixes" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "github_installations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"installation_id" bigint NOT NULL,
	"account_login" text NOT NULL,
	"account_type" text NOT NULL,
	"suspended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "github_installations_installation_id_unique" UNIQUE("installation_id")
);
--> statement-breakpoint
ALTER TABLE "github_installations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "github_installations" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "model_deprecations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"model_id" text NOT NULL,
	"announcement_date" date,
	"deprecation_date" date,
	"shutdown_date" date,
	"replacement_models" text[] DEFAULT '{}' NOT NULL,
	"deprecation_context" text,
	"url" text,
	"content_hash" text NOT NULL,
	"scraped_at" timestamp with time zone,
	"first_observed" timestamp with time zone DEFAULT now() NOT NULL,
	"last_observed" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "model_deprecations_provider_model_id" UNIQUE("provider","model_id")
);
--> statement-breakpoint
CREATE TABLE "provider_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" "llm_provider" NOT NULL,
	"encrypted_key" "bytea" NOT NULL,
	"key_version" integer DEFAULT 1 NOT NULL,
	"last_four" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "provider_keys_user_provider" UNIQUE("user_id","provider")
);
--> statement-breakpoint
ALTER TABLE "provider_keys" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "provider_keys" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "repositories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"installation_id" uuid NOT NULL,
	"github_repo_id" bigint NOT NULL,
	"owner" text NOT NULL,
	"name" text NOT NULL,
	"default_branch" text NOT NULL,
	"private" boolean DEFAULT false NOT NULL,
	"last_scanned_at" timestamp with time zone,
	"auto_merge_enabled" boolean DEFAULT false NOT NULL,
	CONSTRAINT "repositories_github_repo_id_unique" UNIQUE("github_repo_id")
);
--> statement-breakpoint
ALTER TABLE "repositories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "repositories" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"repository_id" uuid NOT NULL,
	"status" "scan_status" DEFAULT 'queued' NOT NULL,
	"trigger_run_id" text,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"files_scanned" integer,
	"error" text
);
--> statement-breakpoint
ALTER TABLE "scans" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "scans" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp with time zone,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "findings" ADD CONSTRAINT "findings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "findings" ADD CONSTRAINT "findings_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "findings" ADD CONSTRAINT "findings_scan_id_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixes" ADD CONSTRAINT "fixes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fixes" ADD CONSTRAINT "fixes_finding_id_findings_id_fk" FOREIGN KEY ("finding_id") REFERENCES "public"."findings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_installations" ADD CONSTRAINT "github_installations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provider_keys" ADD CONSTRAINT "provider_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_installation_id_github_installations_id_fk" FOREIGN KEY ("installation_id") REFERENCES "public"."github_installations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scans" ADD CONSTRAINT "scans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scans" ADD CONSTRAINT "scans_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "findings_tenant_isolation" ON "findings" AS PERMISSIVE FOR ALL TO "deplyx_app" USING ("findings"."user_id" = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK ("findings"."user_id" = nullif(current_setting('app.user_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "fixes_tenant_isolation" ON "fixes" AS PERMISSIVE FOR ALL TO "deplyx_app" USING ("fixes"."user_id" = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK ("fixes"."user_id" = nullif(current_setting('app.user_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "github_installations_tenant_isolation" ON "github_installations" AS PERMISSIVE FOR ALL TO "deplyx_app" USING ("github_installations"."user_id" = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK ("github_installations"."user_id" = nullif(current_setting('app.user_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "provider_keys_tenant_isolation" ON "provider_keys" AS PERMISSIVE FOR ALL TO "deplyx_app" USING ("provider_keys"."user_id" = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK ("provider_keys"."user_id" = nullif(current_setting('app.user_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "repositories_tenant_isolation" ON "repositories" AS PERMISSIVE FOR ALL TO "deplyx_app" USING ("repositories"."user_id" = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK ("repositories"."user_id" = nullif(current_setting('app.user_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "scans_tenant_isolation" ON "scans" AS PERMISSIVE FOR ALL TO "deplyx_app" USING ("scans"."user_id" = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK ("scans"."user_id" = nullif(current_setting('app.user_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "users_tenant_isolation" ON "users" AS PERMISSIVE FOR ALL TO "deplyx_app" USING ("users"."id" = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK ("users"."id" = nullif(current_setting('app.user_id', true), '')::uuid);--> statement-breakpoint
-- ----------------------------------------------------------------------------
-- GRANTs (drizzle-kit does not emit these — hand-patched per
-- docs/plans/02-db-schema-rls.md, migration-generation step). `deplyx_app`
-- (created out-of-band by scripts/create-app-role.ts) gets full CRUD on
-- every tenant table it has a policy for above, SELECT-only on the global
-- `model_deprecations` table, and — deliberately — NOTHING on `accounts`,
-- `sessions`, `verification_tokens` (design decision #4): those are
-- Auth.js-internal and only a BYPASSRLS-capable connection may touch them.
-- ----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA "public" TO "deplyx_app";--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "users" TO "deplyx_app";--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "github_installations" TO "deplyx_app";--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "repositories" TO "deplyx_app";--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "scans" TO "deplyx_app";--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "findings" TO "deplyx_app";--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "fixes" TO "deplyx_app";--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "provider_keys" TO "deplyx_app";--> statement-breakpoint
GRANT SELECT ON TABLE "model_deprecations" TO "deplyx_app";