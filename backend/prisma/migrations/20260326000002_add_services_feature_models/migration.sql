-- Services feature models
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ServiceProviderStatus') THEN
    CREATE TYPE "ServiceProviderStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "ServiceCategory" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "emoji" TEXT NOT NULL DEFAULT '🔧',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ServiceSubCategory" (
  "id" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ServiceSubCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ServiceProvider" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "subCategoryId" TEXT NOT NULL,
  "cnicFront" TEXT NOT NULL,
  "cnicBack" TEXT NOT NULL,
  "experience" INTEGER NOT NULL,
  "phone" TEXT NOT NULL,
  "description" TEXT,
  "status" "ServiceProviderStatus" NOT NULL DEFAULT 'PENDING',
  "rejectionReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ServiceProvider_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ServiceReview" (
  "id" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "seekerId" TEXT NOT NULL,
  "stars" INTEGER NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ServiceReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ServiceProvider_userId_key" ON "ServiceProvider"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "ServiceReview_providerId_seekerId_key" ON "ServiceReview"("providerId", "seekerId");

CREATE INDEX IF NOT EXISTS "ServiceCategory_isActive_idx" ON "ServiceCategory"("isActive");
CREATE INDEX IF NOT EXISTS "ServiceSubCategory_categoryId_idx" ON "ServiceSubCategory"("categoryId");
CREATE INDEX IF NOT EXISTS "ServiceSubCategory_isActive_idx" ON "ServiceSubCategory"("isActive");
CREATE INDEX IF NOT EXISTS "ServiceProvider_status_idx" ON "ServiceProvider"("status");
CREATE INDEX IF NOT EXISTS "ServiceProvider_subCategoryId_idx" ON "ServiceProvider"("subCategoryId");
CREATE INDEX IF NOT EXISTS "ServiceProvider_categoryId_idx" ON "ServiceProvider"("categoryId");
CREATE INDEX IF NOT EXISTS "ServiceReview_providerId_idx" ON "ServiceReview"("providerId");
CREATE INDEX IF NOT EXISTS "ServiceReview_seekerId_idx" ON "ServiceReview"("seekerId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ServiceSubCategory_categoryId_fkey') THEN
    ALTER TABLE "ServiceSubCategory"
      ADD CONSTRAINT "ServiceSubCategory_categoryId_fkey"
      FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ServiceProvider_userId_fkey') THEN
    ALTER TABLE "ServiceProvider"
      ADD CONSTRAINT "ServiceProvider_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ServiceProvider_categoryId_fkey') THEN
    ALTER TABLE "ServiceProvider"
      ADD CONSTRAINT "ServiceProvider_categoryId_fkey"
      FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ServiceProvider_subCategoryId_fkey') THEN
    ALTER TABLE "ServiceProvider"
      ADD CONSTRAINT "ServiceProvider_subCategoryId_fkey"
      FOREIGN KEY ("subCategoryId") REFERENCES "ServiceSubCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ServiceReview_providerId_fkey') THEN
    ALTER TABLE "ServiceReview"
      ADD CONSTRAINT "ServiceReview_providerId_fkey"
      FOREIGN KEY ("providerId") REFERENCES "ServiceProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ServiceReview_seekerId_fkey') THEN
    ALTER TABLE "ServiceReview"
      ADD CONSTRAINT "ServiceReview_seekerId_fkey"
      FOREIGN KEY ("seekerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
