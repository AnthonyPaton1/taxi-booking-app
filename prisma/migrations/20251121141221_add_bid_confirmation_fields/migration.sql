/*
  Warnings:

  - The values [DECLINED] on the enum `BidStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "CanceledBy" AS ENUM ('MANAGER', 'DRIVER');

-- AlterEnum
ALTER TYPE "AdvancedBookingStatus" ADD VALUE 'BID_ACCEPTED';

-- AlterEnum
BEGIN;
CREATE TYPE "BidStatus_new" AS ENUM ('PENDING', 'ACCEPTED', 'CONFIRMED', 'REJECTED', 'EXPIRED', 'WITHDRAWN', 'CANCELED_MANAGER', 'CANCELED_DRIVER');
ALTER TABLE "Bid" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Bid" ALTER COLUMN "status" TYPE "BidStatus_new" USING ("status"::text::"BidStatus_new");
ALTER TYPE "BidStatus" RENAME TO "BidStatus_old";
ALTER TYPE "BidStatus_new" RENAME TO "BidStatus";
DROP TYPE "BidStatus_old";
ALTER TABLE "Bid" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "AdvancedBooking" ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "canceledBy" "CanceledBy",
ADD COLUMN     "confirmedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Bid" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "canceledBy" "CanceledBy",
ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Bid_driverId_status_idx" ON "Bid"("driverId", "status");

-- CreateIndex
CREATE INDEX "Bid_advancedBookingId_status_idx" ON "Bid"("advancedBookingId", "status");

-- CreateIndex
CREATE INDEX "Bid_expiresAt_idx" ON "Bid"("expiresAt");
