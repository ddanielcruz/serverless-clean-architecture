CREATE TABLE IF NOT EXISTS "audios" (
	"id" text PRIMARY KEY NOT NULL,
	"format" text NOT NULL,
	"filename" text NOT NULL,
	"duration" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"audio_id" text NOT NULL,
	"status" text NOT NULL,
	"summary" text,
	"transcription" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notes_user_id_index" ON "notes" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notes_audio_id_index" ON "notes" ("audio_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notes" ADD CONSTRAINT "notes_audio_id_audios_id_fk" FOREIGN KEY ("audio_id") REFERENCES "audios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
