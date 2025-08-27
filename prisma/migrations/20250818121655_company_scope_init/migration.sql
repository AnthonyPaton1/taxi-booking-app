/*
  Warnings:

  - You are about to drop the column `additionalNeeds` on the `RideRequest` table. All the data in the column will be lost.
  - You are about to drop the column `distanceKm` on the `RideRequest` table. All the data in the column will be lost.
  - You are about to drop the column `passengersName` on the `RideRequest` table. All the data in the column will be lost.
  - You are about to drop the `AutoBid` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `companyId` to the `RideRequest` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."CompanyRole" AS ENUM ('COORDINATOR', 'DRIVER');

-- CreateEnum
CREATE TYPE "public"."RideVisibility" AS ENUM ('PRIVATE_TO_COMPANY', 'LINK_ONLY', 'PUBLIC');

-- CreateEnum
CREATE TYPE "public"."RideStatus" AS ENUM ('OPEN', 'CLOSED', 'ACCEPTED', 'SCHEDULED', 'COMPLETED', 'CANCELED');

-- DropForeignKey
ALTER TABLE "public"."AutoBid" DROP CONSTRAINT "AutoBid_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Bid" DROP CONSTRAINT "Bid_rideRequestId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Bid" DROP CONSTRAINT "Bid_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Invoice" DROP CONSTRAINT "Invoice_driverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RideRequest" DROP CONSTRAINT "RideRequest_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."TripFeedback" DROP CONSTRAINT "TripFeedback_rideId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TripFeedback" DROP CONSTRAINT "TripFeedback_userId_fkey";

-- DropIndex
DROP INDEX "public"."Bid_rideRequestId_status_createdAt_idx";

-- DropIndex
DROP INDEX "public"."RideRequest_createdById_pickupTime_idx";

-- DropIndex
DROP INDEX "public"."RideRequest_pickupTime_idx";

-- AlterTable
ALTER TABLE "public"."Bid" ADD COLUMN     "etaMinutes" INTEGER,
ADD COLUMN     "validUntil" TIMESTAMP(3),
ADD COLUMN     "vehicleNotes" TEXT;

-- AlterTable
ALTER TABLE "public"."RideRequest" DROP COLUMN "additionalNeeds",
DROP COLUMN "distanceKm",
DROP COLUMN "passengersName",
ADD COLUMN     "bidCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "bidDeadline" TIMESTAMP(3),
ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "maxBidCents" INTEGER,
ADD COLUMN     "minBidCents" INTEGER,
ADD COLUMN     "status" "public"."RideStatus" NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "visibility" "public"."RideVisibility" NOT NULL DEFAULT 'PRIVATE_TO_COMPANY';

-- DropTable
DROP TABLE "public"."AutoBid";

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserCompany" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "role" "public"."CompanyRole" NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "invitedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."House" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "House_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RideSchedule" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RideSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rideId" TEXT,
    "bidId" TEXT,
    "payload" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverInvite" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriverInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserCompany_companyId_role_idx" ON "public"."UserCompany"("companyId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "UserCompany_userId_companyId_key" ON "public"."UserCompany"("userId", "companyId");

-- CreateIndex
CREATE INDEX "House_companyId_label_idx" ON "public"."House"("companyId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "RideSchedule_rideId_key" ON "public"."RideSchedule"("rideId");

-- CreateIndex
CREATE INDEX "RideSchedule_driverId_startAt_idx" ON "public"."RideSchedule"("driverId", "startAt");

-- CreateIndex
CREATE INDEX "RideSchedule_startAt_idx" ON "public"."RideSchedule"("startAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "public"."Notification"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DriverInvite_token_key" ON "public"."DriverInvite"("token");

-- CreateIndex
CREATE INDEX "DriverInvite_companyId_email_idx" ON "public"."DriverInvite"("companyId", "email");

-- CreateIndex
CREATE INDEX "Bid_rideRequestId_status_amountCents_idx" ON "public"."Bid"("rideRequestId", "status", "amountCents");

-- CreateIndex
CREATE INDEX "RideRequest_companyId_pickupTime_idx" ON "public"."RideRequest"("companyId", "pickupTime");

-- CreateIndex
CREATE INDEX "RideRequest_status_pickupTime_idx" ON "public"."RideRequest"("status", "pickupTime");

-- CreateIndex
CREATE INDEX "RideRequest_bidDeadline_idx" ON "public"."RideRequest"("bidDeadline");

-- AddForeignKey
ALTER TABLE "public"."UserCompany" ADD CONSTRAINT "UserCompany_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCompany" ADD CONSTRAINT "UserCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."House" ADD CONSTRAINT "House_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RideRequest" ADD CONSTRAINT "RideRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RideRequest" ADD CONSTRAINT "RideRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bid" ADD CONSTRAINT "Bid_rideRequestId_fkey" FOREIGN KEY ("rideRequestId") REFERENCES "public"."RideRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bid" ADD CONSTRAINT "Bid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RideSchedule" ADD CONSTRAINT "RideSchedule_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "public"."RideRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RideSchedule" ADD CONSTRAINT "RideSchedule_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "public"."RideRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "public"."Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TripFeedback" ADD CONSTRAINT "TripFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TripFeedback" ADD CONSTRAINT "TripFeedback_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "public"."RideRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverInvite" ADD CONSTRAINT "DriverInvite_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
