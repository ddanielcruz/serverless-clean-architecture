ALTER TABLE "audios" ADD COLUMN "transcription" text;--> statement-breakpoint
ALTER TABLE "notes" DROP COLUMN IF EXISTS "transcription";