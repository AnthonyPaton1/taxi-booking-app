-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('SUPER_ADMIN', 'MANAGER', 'COORDINATOR', 'PUBLIC', 'ADMIN', 'DRIVER');

-- CreateEnum
CREATE TYPE "public"."BusinessType" AS ENUM ('CARE', 'TAXI');

-- CreateEnum
CREATE TYPE "public"."BusinessMembershipRole" AS ENUM ('ADMIN', 'COORDINATOR', 'MANAGER', 'DRIVER', 'OWNER', 'DISPATCHER');

-- CreateEnum
CREATE TYPE "public"."BidStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "public"."FeedbackType" AS ENUM ('NOTE', 'COMPLAINT');

-- CreateEnum
CREATE TYPE "public"."AdvancedBookingVisibility" AS ENUM ('PRIVATE_TO_COMPANY', 'LINK_ONLY', 'PUBLIC');

-- CreateEnum
CREATE TYPE "public"."AdvancedBookingStatus" AS ENUM ('OPEN', 'CLOSED', 'ACCEPTED', 'SCHEDULED', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."InstantBookingStatus" AS ENUM ('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED');

-- CreateTable
CREATE TABLE "public"."RegistrationRequest" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistrationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PasswordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "password" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'PUBLIC',
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "managerId" TEXT,
    "businessId" TEXT,
    "areaId" TEXT,
    "postcode" TEXT,
    "radius" INTEGER,
    "capabilities" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Business" (
    "id" TEXT NOT NULL,
    "type" "public"."BusinessType" NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "address1" TEXT,
    "city" TEXT,
    "postcode" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "adminUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BusinessMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "role" "public"."BusinessMembershipRole" NOT NULL,
    "dbsChecked" BOOLEAN NOT NULL DEFAULT false,
    "insuranceChecked" BOOLEAN NOT NULL DEFAULT false,
    "plInsuranceChecked" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "invitedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "verifyNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BusinessMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."House" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "notes" TEXT,
    "internalId" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "loginName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "House_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdvancedBooking" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "businessId" TEXT,
    "pickupTime" TIMESTAMP(3) NOT NULL,
    "returnTime" TIMESTAMP(3),
    "pickupLocation" TEXT NOT NULL,
    "dropoffLocation" TEXT NOT NULL,
    "wheelchairAccess" BOOLEAN NOT NULL DEFAULT false,
    "doubleWheelchairAccess" BOOLEAN NOT NULL DEFAULT false,
    "highRoof" BOOLEAN NOT NULL DEFAULT false,
    "carerPresent" BOOLEAN NOT NULL DEFAULT false,
    "passengerCount" INTEGER NOT NULL DEFAULT 0,
    "wheelchairUsers" INTEGER NOT NULL DEFAULT 0,
    "nonWAVvehicle" BOOLEAN NOT NULL DEFAULT false,
    "femaleDriverOnly" BOOLEAN NOT NULL DEFAULT false,
    "quietEnvironment" BOOLEAN NOT NULL DEFAULT false,
    "assistanceRequired" BOOLEAN NOT NULL DEFAULT false,
    "noConversation" BOOLEAN NOT NULL DEFAULT false,
    "specificMusic" TEXT,
    "electricScooterStorage" BOOLEAN NOT NULL DEFAULT false,
    "visualSchedule" BOOLEAN NOT NULL DEFAULT false,
    "assistanceAnimal" BOOLEAN NOT NULL DEFAULT false,
    "familiarDriverOnly" BOOLEAN NOT NULL DEFAULT false,
    "ageOfPassenger" INTEGER,
    "escortRequired" BOOLEAN NOT NULL DEFAULT false,
    "preferredLanguage" TEXT,
    "signLanguageRequired" BOOLEAN NOT NULL DEFAULT false,
    "textOnlyCommunication" BOOLEAN NOT NULL DEFAULT false,
    "medicalConditions" TEXT,
    "medicationOnBoard" BOOLEAN NOT NULL DEFAULT false,
    "additionalNeeds" TEXT,
    "visibility" "public"."AdvancedBookingVisibility" NOT NULL DEFAULT 'PRIVATE_TO_COMPANY',
    "bidDeadline" TIMESTAMP(3),
    "status" "public"."AdvancedBookingStatus" NOT NULL DEFAULT 'OPEN',
    "acceptedBidId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AdvancedBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InstantBooking" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "businessId" TEXT,
    "pickupTime" TIMESTAMP(3) NOT NULL,
    "returnTime" TIMESTAMP(3),
    "pickupLocation" TEXT NOT NULL,
    "dropoffLocation" TEXT NOT NULL,
    "wheelchairAccess" BOOLEAN NOT NULL DEFAULT false,
    "doubleWheelchairAccess" BOOLEAN NOT NULL DEFAULT false,
    "highRoof" BOOLEAN NOT NULL DEFAULT false,
    "carerPresent" BOOLEAN NOT NULL DEFAULT false,
    "passengerCount" INTEGER NOT NULL DEFAULT 0,
    "wheelchairUsers" INTEGER NOT NULL DEFAULT 0,
    "nonWAVvehicle" BOOLEAN NOT NULL DEFAULT false,
    "femaleDriverOnly" BOOLEAN NOT NULL DEFAULT false,
    "quietEnvironment" BOOLEAN NOT NULL DEFAULT false,
    "assistanceRequired" BOOLEAN NOT NULL DEFAULT false,
    "noConversation" BOOLEAN NOT NULL DEFAULT false,
    "specificMusic" TEXT,
    "electricScooterStorage" BOOLEAN NOT NULL DEFAULT false,
    "visualSchedule" BOOLEAN NOT NULL DEFAULT false,
    "assistanceAnimal" BOOLEAN NOT NULL DEFAULT false,
    "familiarDriverOnly" BOOLEAN NOT NULL DEFAULT false,
    "ageOfPassenger" INTEGER,
    "escortRequired" BOOLEAN NOT NULL DEFAULT false,
    "preferredLanguage" TEXT,
    "signLanguageRequired" BOOLEAN NOT NULL DEFAULT false,
    "textOnlyCommunication" BOOLEAN NOT NULL DEFAULT false,
    "medicalConditions" TEXT,
    "medicationOnBoard" BOOLEAN NOT NULL DEFAULT false,
    "additionalNeeds" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "acceptedByUserId" TEXT,
    "acceptedByBusinessId" TEXT,
    "status" "public"."InstantBookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstantBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Bid" (
    "id" TEXT NOT NULL,
    "advancedBookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "message" TEXT,
    "etaMinutes" INTEGER,
    "vehicleNotes" TEXT,
    "validUntil" TIMESTAMP(3),
    "status" "public"."BidStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "idempotencyKey" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RideSchedule" (
    "id" TEXT NOT NULL,
    "advancedBookingId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RideSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "advancedBookingId" TEXT,
    "instantBookingId" TEXT,
    "bidId" TEXT,
    "payload" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TripFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "advancedBookingId" TEXT,
    "instantBookingId" TEXT,
    "type" "public"."FeedbackType" NOT NULL DEFAULT 'NOTE',
    "message" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TripFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invoice" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "advancedBookingId" TEXT,
    "instantBookingId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverInvite" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriverInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Incident" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "houseId" TEXT,
    "time" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "emergency" BOOLEAN NOT NULL,
    "actionsTaken" TEXT,
    "followUp" BOOLEAN NOT NULL,
    "image" TEXT,
    "evidenceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationRequest_email_key" ON "public"."RegistrationRequest"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "public"."PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "public"."User"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Business_adminUserId_key" ON "public"."Business"("adminUserId");

-- CreateIndex
CREATE INDEX "BusinessMembership_businessId_role_idx" ON "public"."BusinessMembership"("businessId", "role");

-- CreateIndex
CREATE INDEX "BusinessMembership_businessId_isVerified_idx" ON "public"."BusinessMembership"("businessId", "isVerified");

-- CreateIndex
CREATE INDEX "BusinessMembership_deletedAt_idx" ON "public"."BusinessMembership"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessMembership_userId_businessId_key" ON "public"."BusinessMembership"("userId", "businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Area_name_key" ON "public"."Area"("name");

-- CreateIndex
CREATE UNIQUE INDEX "House_internalId_key" ON "public"."House"("internalId");

-- CreateIndex
CREATE UNIQUE INDEX "House_loginName_key" ON "public"."House"("loginName");

-- CreateIndex
CREATE INDEX "House_businessId_label_idx" ON "public"."House"("businessId", "label");

-- CreateIndex
CREATE INDEX "House_deletedAt_idx" ON "public"."House"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdvancedBooking_acceptedBidId_key" ON "public"."AdvancedBooking"("acceptedBidId");

-- CreateIndex
CREATE INDEX "AdvancedBooking_businessId_pickupTime_idx" ON "public"."AdvancedBooking"("businessId", "pickupTime");

-- CreateIndex
CREATE INDEX "AdvancedBooking_status_pickupTime_idx" ON "public"."AdvancedBooking"("status", "pickupTime");

-- CreateIndex
CREATE INDEX "AdvancedBooking_bidDeadline_idx" ON "public"."AdvancedBooking"("bidDeadline");

-- CreateIndex
CREATE INDEX "AdvancedBooking_deletedAt_idx" ON "public"."AdvancedBooking"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Bid_idempotencyKey_key" ON "public"."Bid"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Bid_advancedBookingId_status_amountCents_idx" ON "public"."Bid"("advancedBookingId", "status", "amountCents");

-- CreateIndex
CREATE INDEX "Bid_userId_createdAt_idx" ON "public"."Bid"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Bid_deletedAt_idx" ON "public"."Bid"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RideSchedule_advancedBookingId_key" ON "public"."RideSchedule"("advancedBookingId");

-- CreateIndex
CREATE INDEX "RideSchedule_driverId_startAt_idx" ON "public"."RideSchedule"("driverId", "startAt");

-- CreateIndex
CREATE INDEX "RideSchedule_deletedAt_idx" ON "public"."RideSchedule"("deletedAt");

-- CreateIndex
CREATE INDEX "RideSchedule_startAt_idx" ON "public"."RideSchedule"("startAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "public"."Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_deletedAt_idx" ON "public"."Notification"("deletedAt");

-- CreateIndex
CREATE INDEX "TripFeedback_deletedAt_idx" ON "public"."TripFeedback"("deletedAt");

-- CreateIndex
CREATE INDEX "TripFeedback_userId_createdAt_idx" ON "public"."TripFeedback"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "TripFeedback_advancedBookingId_idx" ON "public"."TripFeedback"("advancedBookingId");

-- CreateIndex
CREATE INDEX "TripFeedback_instantBookingId_idx" ON "public"."TripFeedback"("instantBookingId");

-- CreateIndex
CREATE INDEX "Invoice_deletedAt_idx" ON "public"."Invoice"("deletedAt");

-- CreateIndex
CREATE INDEX "Invoice_driverId_issuedAt_idx" ON "public"."Invoice"("driverId", "issuedAt");

-- CreateIndex
CREATE INDEX "Invoice_advancedBookingId_idx" ON "public"."Invoice"("advancedBookingId");

-- CreateIndex
CREATE INDEX "Invoice_instantBookingId_idx" ON "public"."Invoice"("instantBookingId");

-- CreateIndex
CREATE UNIQUE INDEX "DriverInvite_token_key" ON "public"."DriverInvite"("token");

-- CreateIndex
CREATE INDEX "DriverInvite_businessId_email_idx" ON "public"."DriverInvite"("businessId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "public"."PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "public"."Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Business" ADD CONSTRAINT "Business_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BusinessMembership" ADD CONSTRAINT "BusinessMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BusinessMembership" ADD CONSTRAINT "BusinessMembership_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BusinessMembership" ADD CONSTRAINT "BusinessMembership_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."House" ADD CONSTRAINT "House_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdvancedBooking" ADD CONSTRAINT "AdvancedBooking_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdvancedBooking" ADD CONSTRAINT "AdvancedBooking_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdvancedBooking" ADD CONSTRAINT "AdvancedBooking_acceptedBidId_fkey" FOREIGN KEY ("acceptedBidId") REFERENCES "public"."Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InstantBooking" ADD CONSTRAINT "InstantBooking_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InstantBooking" ADD CONSTRAINT "InstantBooking_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InstantBooking" ADD CONSTRAINT "InstantBooking_acceptedByUserId_fkey" FOREIGN KEY ("acceptedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InstantBooking" ADD CONSTRAINT "InstantBooking_acceptedByBusinessId_fkey" FOREIGN KEY ("acceptedByBusinessId") REFERENCES "public"."Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bid" ADD CONSTRAINT "Bid_advancedBookingId_fkey" FOREIGN KEY ("advancedBookingId") REFERENCES "public"."AdvancedBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bid" ADD CONSTRAINT "Bid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RideSchedule" ADD CONSTRAINT "RideSchedule_advancedBookingId_fkey" FOREIGN KEY ("advancedBookingId") REFERENCES "public"."AdvancedBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RideSchedule" ADD CONSTRAINT "RideSchedule_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_advancedBookingId_fkey" FOREIGN KEY ("advancedBookingId") REFERENCES "public"."AdvancedBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_instantBookingId_fkey" FOREIGN KEY ("instantBookingId") REFERENCES "public"."InstantBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "public"."Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TripFeedback" ADD CONSTRAINT "TripFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TripFeedback" ADD CONSTRAINT "TripFeedback_advancedBookingId_fkey" FOREIGN KEY ("advancedBookingId") REFERENCES "public"."AdvancedBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TripFeedback" ADD CONSTRAINT "TripFeedback_instantBookingId_fkey" FOREIGN KEY ("instantBookingId") REFERENCES "public"."InstantBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_advancedBookingId_fkey" FOREIGN KEY ("advancedBookingId") REFERENCES "public"."AdvancedBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_instantBookingId_fkey" FOREIGN KEY ("instantBookingId") REFERENCES "public"."InstantBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverInvite" ADD CONSTRAINT "DriverInvite_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Incident" ADD CONSTRAINT "Incident_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Incident" ADD CONSTRAINT "Incident_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Incident" ADD CONSTRAINT "Incident_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "public"."House"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
