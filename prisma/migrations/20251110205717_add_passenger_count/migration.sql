/*
  Warnings:

  - Added the required column `passengerCount` to the `AdvancedBooking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdvancedBooking" ADD COLUMN     "blockNotes" TEXT,
ADD COLUMN     "blockRides" JSONB,
ADD COLUMN     "isBlockBooking" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passengerCount" INTEGER NOT NULL,
ADD COLUMN     "totalRidesInBlock" INTEGER NOT NULL DEFAULT 1;
