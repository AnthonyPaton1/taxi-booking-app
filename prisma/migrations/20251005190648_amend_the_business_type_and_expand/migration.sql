/*
  Warnings:

  - Changed the type of `type` on the `Business` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BusinessType" ADD VALUE 'EDUCATION';
ALTER TYPE "BusinessType" ADD VALUE 'DELIVERY';
ALTER TYPE "BusinessType" ADD VALUE 'SUPPORT';
ALTER TYPE "BusinessType" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "Business" DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL;
