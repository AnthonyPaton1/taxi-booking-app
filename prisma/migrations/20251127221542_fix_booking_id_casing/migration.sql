/*
  Warnings:

  - You are about to drop the column `advancedBookingId` on the `Bid` table. All the data in the column will be lost.
  - You are about to drop the column `advancedBookingId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `instantBookingId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `advancedBookingId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `instantBookingId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `advancedBookingId` on the `RideSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `advancedBookingId` on the `TripFeedback` table. All the data in the column will be lost.
  - You are about to drop the column `instantBookingId` on the `TripFeedback` table. All the data in the column will be lost.
  - You are about to drop the `AdvancedBooking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InstantBooking` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[bookingId]` on the table `RideSchedule` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bookingId` to the `Bid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookingId` to the `RideSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BookingVisibility" AS ENUM ('PRIVATE_TO_COMPANY', 'AREA_WIDE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'BID_ACCEPTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED');

-- DropForeignKey
ALTER TABLE "AdvancedBooking" DROP CONSTRAINT "AdvancedBooking_acceptedBidId_fkey";

-- DropForeignKey
ALTER TABLE "AdvancedBooking" DROP CONSTRAINT "AdvancedBooking_accessibilityProfileId_fkey";

-- DropForeignKey
ALTER TABLE "AdvancedBooking" DROP CONSTRAINT "AdvancedBooking_businessId_fkey";

-- DropForeignKey
ALTER TABLE "AdvancedBooking" DROP CONSTRAINT "AdvancedBooking_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Bid" DROP CONSTRAINT "Bid_advancedBookingId_fkey";

-- DropForeignKey
ALTER TABLE "InstantBooking" DROP CONSTRAINT "InstantBooking_acceptedByBusinessId_fkey";

-- DropForeignKey
ALTER TABLE "InstantBooking" DROP CONSTRAINT "InstantBooking_acceptedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "InstantBooking" DROP CONSTRAINT "InstantBooking_accessibilityProfileId_fkey";

-- DropForeignKey
ALTER TABLE "InstantBooking" DROP CONSTRAINT "InstantBooking_businessId_fkey";

-- DropForeignKey
ALTER TABLE "InstantBooking" DROP CONSTRAINT "InstantBooking_createdById_fkey";

-- DropForeignKey
ALTER TABLE "InstantBooking" DROP CONSTRAINT "InstantBooking_driverId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_advancedBookingId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_instantBookingId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_advancedBookingId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_instantBookingId_fkey";

-- DropForeignKey
ALTER TABLE "RideSchedule" DROP CONSTRAINT "RideSchedule_advancedBookingId_fkey";

-- DropForeignKey
ALTER TABLE "TripFeedback" DROP CONSTRAINT "TripFeedback_advancedBookingId_fkey";

-- DropForeignKey
ALTER TABLE "TripFeedback" DROP CONSTRAINT "TripFeedback_instantBookingId_fkey";

-- DropIndex
DROP INDEX "Bid_advancedBookingId_status_amountCents_idx";

-- DropIndex
DROP INDEX "Bid_advancedBookingId_status_idx";

-- DropIndex
DROP INDEX "Invoice_advancedBookingId_idx";

-- DropIndex
DROP INDEX "Invoice_instantBookingId_idx";

-- DropIndex
DROP INDEX "RideSchedule_advancedBookingId_key";

-- DropIndex
DROP INDEX "TripFeedback_advancedBookingId_idx";

-- DropIndex
DROP INDEX "TripFeedback_instantBookingId_idx";

-- AlterTable
ALTER TABLE "Bid" DROP COLUMN "advancedBookingId",
ADD COLUMN     "bookingId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "advancedBookingId",
DROP COLUMN "instantBookingId",
ADD COLUMN     "bookingId" TEXT;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "advancedBookingId",
DROP COLUMN "instantBookingId",
ADD COLUMN     "bookingId" TEXT;

-- AlterTable
ALTER TABLE "RideSchedule" DROP COLUMN "advancedBookingId",
ADD COLUMN     "bookingId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TripFeedback" DROP COLUMN "advancedBookingId",
DROP COLUMN "instantBookingId",
ADD COLUMN     "bookingId" TEXT;

-- DropTable
DROP TABLE "AdvancedBooking";

-- DropTable
DROP TABLE "InstantBooking";

-- DropEnum
DROP TYPE "AdvancedBookingStatus";

-- DropEnum
DROP TYPE "AdvancedBookingVisibility";

-- DropEnum
DROP TYPE "InstantBookingStatus";

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "businessId" TEXT,
    "pickupTime" TIMESTAMP(3) NOT NULL,
    "returnTime" TIMESTAMP(3),
    "pickupLocation" TEXT NOT NULL,
    "pickupLatitude" DOUBLE PRECISION,
    "pickupLongitude" DOUBLE PRECISION,
    "dropoffLocation" TEXT NOT NULL,
    "dropoffLatitude" DOUBLE PRECISION,
    "dropoffLongitude" DOUBLE PRECISION,
    "initials" TEXT[],
    "accessibilityProfileId" TEXT NOT NULL,
    "visibility" "BookingVisibility" NOT NULL DEFAULT 'PRIVATE_TO_COMPANY',
    "bidDeadline" TIMESTAMP(3),
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "driverId" TEXT,
    "acceptedBidId" TEXT,
    "estimatedCostPence" INTEGER,
    "finalCostPence" INTEGER,
    "distanceMiles" DOUBLE PRECISION,
    "durationMinutes" INTEGER,
    "confirmedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "canceledBy" "CanceledBy",
    "cancellationReason" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "acceptedByUserId" TEXT,
    "acceptedByBusinessId" TEXT,
    "blockNotes" TEXT,
    "blockRides" JSONB,
    "isBlockBooking" BOOLEAN NOT NULL DEFAULT false,
    "totalRidesInBlock" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_accessibilityProfileId_key" ON "Booking"("accessibilityProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_acceptedBidId_key" ON "Booking"("acceptedBidId");

-- CreateIndex
CREATE INDEX "Booking_status_pickupTime_deletedAt_idx" ON "Booking"("status", "pickupTime", "deletedAt");

-- CreateIndex
CREATE INDEX "Booking_driverId_status_deletedAt_idx" ON "Booking"("driverId", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "Booking_createdById_deletedAt_idx" ON "Booking"("createdById", "deletedAt");

-- CreateIndex
CREATE INDEX "Booking_businessId_status_deletedAt_idx" ON "Booking"("businessId", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "Booking_pickupLatitude_pickupLongitude_idx" ON "Booking"("pickupLatitude", "pickupLongitude");

-- CreateIndex
CREATE INDEX "Booking_accessibilityProfileId_idx" ON "Booking"("accessibilityProfileId");

-- CreateIndex
CREATE INDEX "Bid_bookingId_status_amountCents_idx" ON "Bid"("bookingId", "status", "amountCents");

-- CreateIndex
CREATE INDEX "Bid_bookingId_status_idx" ON "Bid"("bookingId", "status");

-- CreateIndex
CREATE INDEX "Invoice_bookingId_idx" ON "Invoice"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "RideSchedule_bookingId_key" ON "RideSchedule"("bookingId");

-- CreateIndex
CREATE INDEX "TripFeedback_bookingId_idx" ON "TripFeedback"("bookingId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_acceptedBidId_fkey" FOREIGN KEY ("acceptedBidId") REFERENCES "Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_acceptedByBusinessId_fkey" FOREIGN KEY ("acceptedByBusinessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_acceptedByUserId_fkey" FOREIGN KEY ("acceptedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_accessibilityProfileId_fkey" FOREIGN KEY ("accessibilityProfileId") REFERENCES "AccessibilityProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideSchedule" ADD CONSTRAINT "RideSchedule_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripFeedback" ADD CONSTRAINT "TripFeedback_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
