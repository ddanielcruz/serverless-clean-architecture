CREATE TABLE IF NOT EXISTS "confirmation_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"type" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "confirmation_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "confirmation_tokens_user_id_index" ON "confirmation_tokens" ("user_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "confirmation_tokens" ADD CONSTRAINT "confirmation_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
