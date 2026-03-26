-- Add optional map/location links for restaurants and cloth brands
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "locationLink" TEXT;
ALTER TABLE "ClothBrand" ADD COLUMN IF NOT EXISTS "locationLink" TEXT;
