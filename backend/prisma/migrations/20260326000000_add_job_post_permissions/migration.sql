-- Add job posting permission flags to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "canPostJobs" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "jobPostRequestPending" BOOLEAN NOT NULL DEFAULT false;
