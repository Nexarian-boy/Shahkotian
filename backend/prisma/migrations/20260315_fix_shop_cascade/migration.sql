-- Fix Shop.ownerId FK to use ON DELETE SET NULL
ALTER TABLE "Shop" DROP CONSTRAINT IF EXISTS "Shop_ownerId_fkey";
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_ownerId_fkey"
FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL;
