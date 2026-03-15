-- Add replyToId and FK for BazarChatMessage replies
ALTER TABLE "BazarChatMessage" ADD COLUMN IF NOT EXISTS "replyToId" TEXT;
-- Add FK constraint referencing same table, set null on delete
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'BazarChatMessage_replyToId_fkey'
    ) THEN
        ALTER TABLE "BazarChatMessage"
        ADD CONSTRAINT "BazarChatMessage_replyToId_fkey"
        FOREIGN KEY ("replyToId") REFERENCES "BazarChatMessage"("id") ON DELETE SET NULL;
    END IF;
END$$;
