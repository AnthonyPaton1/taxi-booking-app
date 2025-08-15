-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('COORDINATOR', 'MANAGER', 'DRIVER');

-- CreateEnum
CREATE TYPE "public"."BidStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "public"."FeedbackType" AS ENUM ('NOTE', 'COMPLAINT');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'DRIVER',
    "managerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RideRequest" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "pickupTime" TIMESTAMP(3) NOT NULL,
    "returnTime" TIMESTAMP(3),
    "pickupLocation" TEXT NOT NULL,
    "dropoffLocation" TEXT NOT NULL,
    "wheelchairAccess" BOOLEAN NOT NULL DEFAULT false,
    "highRoof" BOOLEAN NOT NULL DEFAULT false,
    "carerPresent" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "distanceKm" DOUBLE PRECISION,
    "passengersName" TEXT,
    "additionalNeeds" TEXT,
    "acceptedBidId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RideRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Bid" (
    "id" TEXT NOT NULL,
    "rideRequestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "message" TEXT,
    "status" "public"."BidStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AutoBid" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "minDistanceKm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxDistanceKm" DOUBLE PRECISION NOT NULL,
    "minAmountCents" INTEGER NOT NULL DEFAULT 0,
    "maxAmountCents" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutoBid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TripFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "type" "public"."FeedbackType" NOT NULL DEFAULT 'NOTE',
    "message" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invoice" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "rideId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "RideRequest_acceptedBidId_key" ON "public"."RideRequest"("acceptedBidId");

-- CreateIndex
CREATE INDEX "RideRequest_createdById_pickupTime_idx" ON "public"."RideRequest"("createdById", "pickupTime");

-- CreateIndex
CREATE INDEX "RideRequest_pickupTime_idx" ON "public"."RideRequest"("pickupTime");

-- CreateIndex
CREATE INDEX "Bid_rideRequestId_status_createdAt_idx" ON "public"."Bid"("rideRequestId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Bid_userId_createdAt_idx" ON "public"."Bid"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AutoBid_userId_active_idx" ON "public"."AutoBid"("userId", "active");

-- CreateIndex
CREATE INDEX "TripFeedback_rideId_idx" ON "public"."TripFeedback"("rideId");

-- CreateIndex
CREATE INDEX "TripFeedback_userId_createdAt_idx" ON "public"."TripFeedback"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Invoice_driverId_issuedAt_idx" ON "public"."Invoice"("driverId", "issuedAt");

-- CreateIndex
CREATE INDEX "Invoice_rideId_idx" ON "public"."Invoice"("rideId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RideRequest" ADD CONSTRAINT "RideRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RideRequest" ADD CONSTRAINT "RideRequest_acceptedBidId_fkey" FOREIGN KEY ("acceptedBidId") REFERENCES "public"."Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bid" ADD CONSTRAINT "Bid_rideRequestId_fkey" FOREIGN KEY ("rideRequestId") REFERENCES "public"."RideRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bid" ADD CONSTRAINT "Bid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AutoBid" ADD CONSTRAINT "AutoBid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TripFeedback" ADD CONSTRAINT "TripFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TripFeedback" ADD CONSTRAINT "TripFeedback_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "public"."RideRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "public"."RideRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
