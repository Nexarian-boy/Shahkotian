-- App settings for runtime feature toggles (e.g., ads on/off)
CREATE TABLE IF NOT EXISTS "AppSetting" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "boolValue" BOOLEAN,
  "stringValue" TEXT,
  "jsonValue" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AppSetting_key_key" ON "AppSetting"("key");
CREATE INDEX IF NOT EXISTS "AppSetting_updatedAt_idx" ON "AppSetting"("updatedAt" DESC);
