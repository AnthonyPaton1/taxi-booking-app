-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'MANAGER', 'COORDINATOR', 'PUBLIC', 'ADMIN', 'DRIVER');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('CARE', 'TAXI', 'EDUCATION', 'DELIVERY', 'SUPPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "BusinessMembershipRole" AS ENUM ('ADMIN', 'COORDINATOR', 'MANAGER', 'DRIVER', 'OWNER', 'DISPATCHER');

-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('NOTE', 'COMPLAINT');

-- CreateEnum
CREATE TYPE "AdvancedBookingVisibility" AS ENUM ('PRIVATE_TO_COMPANY', 'LINK_ONLY', 'PUBLIC');

-- CreateEnum
CREATE TYPE "AdvancedBookingStatus" AS ENUM ('OPEN', 'CLOSED', 'ACCEPTED', 'SCHEDULED', 'COMPLETED', 'CANCELED', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "InstantBookingStatus" AS ENUM ('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "VehicleClass" AS ENUM ('STANDARD_CAR', 'LARGE_CAR', 'SIDE_LOADING_WAV', 'REAR_LOADING_WAV', 'DOUBLE_WAV', 'MINIBUS_ACCESSIBLE', 'MINIBUS_STANDARD');

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PUBLIC',
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "driverOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "managerOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "coordinatorOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "adminOnboarded" BOOLEAN NOT NULL DEFAULT false,
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
CREATE TABLE "AccessibilityProfile" (
    "id" TEXT NOT NULL,
    "highRoof" BOOLEAN NOT NULL DEFAULT false,
    "seatTransferHelp" BOOLEAN NOT NULL DEFAULT false,
    "mobilityAidStorage" BOOLEAN NOT NULL DEFAULT false,
    "electricScooterStorage" BOOLEAN NOT NULL DEFAULT false,
    "ageOfPassenger" INTEGER,
    "carerPresent" BOOLEAN NOT NULL DEFAULT false,
    "escortRequired" BOOLEAN NOT NULL DEFAULT false,
    "quietEnvironment" BOOLEAN NOT NULL DEFAULT false,
    "noConversation" BOOLEAN NOT NULL DEFAULT false,
    "noScents" BOOLEAN NOT NULL DEFAULT false,
    "specificMusic" TEXT,
    "visualSchedule" BOOLEAN NOT NULL DEFAULT false,
    "signLanguageRequired" BOOLEAN NOT NULL DEFAULT false,
    "textOnlyCommunication" BOOLEAN NOT NULL DEFAULT false,
    "preferredLanguage" TEXT,
    "translationSupport" BOOLEAN NOT NULL DEFAULT false,
    "assistanceRequired" BOOLEAN NOT NULL DEFAULT false,
    "assistanceAnimal" BOOLEAN NOT NULL DEFAULT false,
    "familiarDriverOnly" BOOLEAN NOT NULL DEFAULT false,
    "femaleDriverOnly" BOOLEAN NOT NULL DEFAULT false,
    "nonWAVvehicle" BOOLEAN NOT NULL DEFAULT false,
    "medicationOnBoard" BOOLEAN NOT NULL DEFAULT false,
    "medicalConditions" TEXT,
    "firstAidTrained" BOOLEAN NOT NULL DEFAULT false,
    "conditionAwareness" BOOLEAN NOT NULL DEFAULT false,
    "additionalNeeds" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "vehicleClassRequired" "VehicleClass",
    "wheelchairUsersStaySeated" INTEGER NOT NULL DEFAULT 0,
    "wheelchairUsersCanTransfer" INTEGER NOT NULL DEFAULT 0,
    "ambulatoryPassengers" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AccessibilityProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vehicleReg" TEXT NOT NULL,
    "amenities" TEXT[],
    "localPostcode" TEXT NOT NULL,
    "radiusMiles" INTEGER NOT NULL,
    "baseLat" DOUBLE PRECISION,
    "baseLng" DOUBLE PRECISION,
    "phone" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "gender" TEXT,
    "completedRides" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "accessibilityProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "suspendedBy" TEXT,
    "suspendedDate" TIMESTAMP(3),
    "suspendedReason" TEXT,
    "deletedAt" TIMESTAMP(3),
    "vehicleClass" "VehicleClass" NOT NULL,
    "wheelchairSpacesInstalled" INTEGER NOT NULL DEFAULT 0,
    "seatedCapacityRemaining" INTEGER NOT NULL DEFAULT 4,
    "canAccommodateTransfers" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverCompliance" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "ukDrivingLicence" BOOLEAN NOT NULL,
    "licenceNumber" TEXT NOT NULL,
    "localAuthorityRegistered" BOOLEAN NOT NULL,
    "dbsChecked" BOOLEAN NOT NULL,
    "publicLiabilityInsurance" BOOLEAN NOT NULL,
    "fullyCompInsurance" BOOLEAN NOT NULL,
    "healthCheckPassed" BOOLEAN NOT NULL,
    "englishProficiency" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dbsCheckedBy" TEXT,
    "dbsIssueDate" TIMESTAMP(3),
    "dbsStatus" TEXT,
    "dbsUpdateServiceConsent" BOOLEAN NOT NULL DEFAULT false,
    "dbsUpdateServiceConsentDate" TIMESTAMP(3),
    "dbsUpdateServiceNumber" TEXT,
    "lastDbsCheck" TIMESTAMP(3),
    "nextDbsCheckDue" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DriverCompliance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "address1" TEXT,
    "city" TEXT,
    "postcode" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "adminUserId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "role" "BusinessMembershipRole" NOT NULL,
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
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "House" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "companyId" TEXT,
    "label" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "notes" TEXT,
    "internalId" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "loginName" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "managerId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,

    CONSTRAINT "House_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resident" (
    "id" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedLocation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "notes" TEXT,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvancedBooking" (
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
    "visibility" "AdvancedBookingVisibility" NOT NULL DEFAULT 'PRIVATE_TO_COMPANY',
    "bidDeadline" TIMESTAMP(3),
    "status" "AdvancedBookingStatus" NOT NULL DEFAULT 'OPEN',
    "acceptedBidId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "blockNotes" TEXT,
    "blockRides" JSONB,
    "isBlockBooking" BOOLEAN NOT NULL DEFAULT false,
    "totalRidesInBlock" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "AdvancedBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstantBooking" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "businessId" TEXT,
    "pickupTime" TIMESTAMP(3) NOT NULL,
    "returnTime" TIMESTAMP(3),
    "pickupLocation" TEXT NOT NULL,
    "dropoffLocation" TEXT NOT NULL,
    "initials" TEXT[],
    "driverId" TEXT,
    "accessibilityProfileId" TEXT NOT NULL,
    "estimatedCostPence" INTEGER,
    "finalCostPence" INTEGER,
    "distanceMiles" DOUBLE PRECISION,
    "durationMinutes" INTEGER,
    "pickupLatitude" DOUBLE PRECISION,
    "pickupLongitude" DOUBLE PRECISION,
    "dropoffLatitude" DOUBLE PRECISION,
    "dropoffLongitude" DOUBLE PRECISION,
    "acceptedAt" TIMESTAMP(3),
    "acceptedByUserId" TEXT,
    "acceptedByBusinessId" TEXT,
    "status" "InstantBookingStatus" NOT NULL DEFAULT 'PENDING',
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "InstantBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "advancedBookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "message" TEXT,
    "etaMinutes" INTEGER,
    "vehicleNotes" TEXT,
    "validUntil" TIMESTAMP(3),
    "status" "BidStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "driverId" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RideSchedule" (
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
CREATE TABLE "Notification" (
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
CREATE TABLE "TripFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "advancedBookingId" TEXT,
    "instantBookingId" TEXT,
    "type" "FeedbackType" NOT NULL DEFAULT 'NOTE',
    "message" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TripFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
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
CREATE TABLE "Incident" (
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
CREATE TABLE "Account" (
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
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_deletedAt_idx" ON "User"("role", "deletedAt");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "AccessibilityProfile_femaleDriverOnly_idx" ON "AccessibilityProfile"("femaleDriverOnly");

-- CreateIndex
CREATE INDEX "AccessibilityProfile_assistanceAnimal_idx" ON "AccessibilityProfile"("assistanceAnimal");

-- CreateIndex
CREATE INDEX "AccessibilityProfile_deletedAt_idx" ON "AccessibilityProfile"("deletedAt");

-- CreateIndex
CREATE INDEX "AccessibilityProfile_vehicleClassRequired_idx" ON "AccessibilityProfile"("vehicleClassRequired");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_userId_key" ON "Driver"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_accessibilityProfileId_key" ON "Driver"("accessibilityProfileId");

-- CreateIndex
CREATE INDEX "Driver_approved_suspended_deletedAt_vehicleClass_idx" ON "Driver"("approved", "suspended", "deletedAt", "vehicleClass");

-- CreateIndex
CREATE INDEX "Driver_baseLat_baseLng_idx" ON "Driver"("baseLat", "baseLng");

-- CreateIndex
CREATE INDEX "Driver_userId_idx" ON "Driver"("userId");

-- CreateIndex
CREATE INDEX "Driver_accessibilityProfileId_idx" ON "Driver"("accessibilityProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "DriverCompliance_driverId_key" ON "DriverCompliance"("driverId");

-- CreateIndex
CREATE INDEX "DriverCompliance_driverId_idx" ON "DriverCompliance"("driverId");

-- CreateIndex
CREATE INDEX "DriverCompliance_nextDbsCheckDue_deletedAt_idx" ON "DriverCompliance"("nextDbsCheckDue", "deletedAt");

-- CreateIndex
CREATE INDEX "DriverCompliance_dbsStatus_idx" ON "DriverCompliance"("dbsStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Business_adminUserId_key" ON "Business"("adminUserId");

-- CreateIndex
CREATE INDEX "Business_adminUserId_idx" ON "Business"("adminUserId");

-- CreateIndex
CREATE INDEX "Business_lat_lng_idx" ON "Business"("lat", "lng");

-- CreateIndex
CREATE INDEX "Business_postcode_idx" ON "Business"("postcode");

-- CreateIndex
CREATE INDEX "Business_deletedAt_idx" ON "Business"("deletedAt");

-- CreateIndex
CREATE INDEX "BusinessMembership_businessId_role_idx" ON "BusinessMembership"("businessId", "role");

-- CreateIndex
CREATE INDEX "BusinessMembership_businessId_isVerified_idx" ON "BusinessMembership"("businessId", "isVerified");

-- CreateIndex
CREATE INDEX "BusinessMembership_deletedAt_idx" ON "BusinessMembership"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessMembership_userId_businessId_key" ON "BusinessMembership"("userId", "businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Area_name_key" ON "Area"("name");

-- CreateIndex
CREATE UNIQUE INDEX "House_internalId_key" ON "House"("internalId");

-- CreateIndex
CREATE UNIQUE INDEX "House_loginName_key" ON "House"("loginName");

-- CreateIndex
CREATE INDEX "House_businessId_label_idx" ON "House"("businessId", "label");

-- CreateIndex
CREATE INDEX "House_deletedAt_idx" ON "House"("deletedAt");

-- CreateIndex
CREATE INDEX "SavedLocation_userId_idx" ON "SavedLocation"("userId");

-- CreateIndex
CREATE INDEX "SavedLocation_userId_useCount_idx" ON "SavedLocation"("userId", "useCount");

-- CreateIndex
CREATE UNIQUE INDEX "AdvancedBooking_accessibilityProfileId_key" ON "AdvancedBooking"("accessibilityProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "AdvancedBooking_acceptedBidId_key" ON "AdvancedBooking"("acceptedBidId");

-- CreateIndex
CREATE INDEX "AdvancedBooking_status_pickupTime_deletedAt_idx" ON "AdvancedBooking"("status", "pickupTime", "deletedAt");

-- CreateIndex
CREATE INDEX "AdvancedBooking_status_bidDeadline_deletedAt_idx" ON "AdvancedBooking"("status", "bidDeadline", "deletedAt");

-- CreateIndex
CREATE INDEX "AdvancedBooking_createdById_deletedAt_idx" ON "AdvancedBooking"("createdById", "deletedAt");

-- CreateIndex
CREATE INDEX "AdvancedBooking_businessId_status_deletedAt_idx" ON "AdvancedBooking"("businessId", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "AdvancedBooking_pickupLatitude_pickupLongitude_idx" ON "AdvancedBooking"("pickupLatitude", "pickupLongitude");

-- CreateIndex
CREATE INDEX "AdvancedBooking_accessibilityProfileId_idx" ON "AdvancedBooking"("accessibilityProfileId");

-- CreateIndex
CREATE INDEX "AdvancedBooking_acceptedBidId_idx" ON "AdvancedBooking"("acceptedBidId");

-- CreateIndex
CREATE UNIQUE INDEX "InstantBooking_accessibilityProfileId_key" ON "InstantBooking"("accessibilityProfileId");

-- CreateIndex
CREATE INDEX "InstantBooking_status_pickupTime_deletedAt_idx" ON "InstantBooking"("status", "pickupTime", "deletedAt");

-- CreateIndex
CREATE INDEX "InstantBooking_driverId_status_idx" ON "InstantBooking"("driverId", "status");

-- CreateIndex
CREATE INDEX "InstantBooking_createdById_deletedAt_idx" ON "InstantBooking"("createdById", "deletedAt");

-- CreateIndex
CREATE INDEX "InstantBooking_pickupLatitude_pickupLongitude_idx" ON "InstantBooking"("pickupLatitude", "pickupLongitude");

-- CreateIndex
CREATE INDEX "InstantBooking_accessibilityProfileId_idx" ON "InstantBooking"("accessibilityProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "Bid_idempotencyKey_key" ON "Bid"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Bid_advancedBookingId_status_amountCents_idx" ON "Bid"("advancedBookingId", "status", "amountCents");

-- CreateIndex
CREATE INDEX "Bid_userId_createdAt_idx" ON "Bid"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Bid_deletedAt_idx" ON "Bid"("deletedAt");

-- CreateIndex
CREATE INDEX "Bid_status_createdAt_idx" ON "Bid"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RideSchedule_advancedBookingId_key" ON "RideSchedule"("advancedBookingId");

-- CreateIndex
CREATE INDEX "RideSchedule_driverId_startAt_idx" ON "RideSchedule"("driverId", "startAt");

-- CreateIndex
CREATE INDEX "RideSchedule_deletedAt_idx" ON "RideSchedule"("deletedAt");

-- CreateIndex
CREATE INDEX "RideSchedule_startAt_idx" ON "RideSchedule"("startAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_deletedAt_idx" ON "Notification"("deletedAt");

-- CreateIndex
CREATE INDEX "TripFeedback_deletedAt_idx" ON "TripFeedback"("deletedAt");

-- CreateIndex
CREATE INDEX "TripFeedback_userId_createdAt_idx" ON "TripFeedback"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "TripFeedback_advancedBookingId_idx" ON "TripFeedback"("advancedBookingId");

-- CreateIndex
CREATE INDEX "TripFeedback_instantBookingId_idx" ON "TripFeedback"("instantBookingId");

-- CreateIndex
CREATE INDEX "Invoice_deletedAt_idx" ON "Invoice"("deletedAt");

-- CreateIndex
CREATE INDEX "Invoice_driverId_issuedAt_idx" ON "Invoice"("driverId", "issuedAt");

-- CreateIndex
CREATE INDEX "Invoice_advancedBookingId_idx" ON "Invoice"("advancedBookingId");

-- CreateIndex
CREATE INDEX "Invoice_instantBookingId_idx" ON "Invoice"("instantBookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_accessibilityProfileId_fkey" FOREIGN KEY ("accessibilityProfileId") REFERENCES "AccessibilityProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverCompliance" ADD CONSTRAINT "DriverCompliance_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessMembership" ADD CONSTRAINT "BusinessMembership_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessMembership" ADD CONSTRAINT "BusinessMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessMembership" ADD CONSTRAINT "BusinessMembership_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resident" ADD CONSTRAINT "Resident_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedLocation" ADD CONSTRAINT "SavedLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvancedBooking" ADD CONSTRAINT "AdvancedBooking_acceptedBidId_fkey" FOREIGN KEY ("acceptedBidId") REFERENCES "Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvancedBooking" ADD CONSTRAINT "AdvancedBooking_accessibilityProfileId_fkey" FOREIGN KEY ("accessibilityProfileId") REFERENCES "AccessibilityProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvancedBooking" ADD CONSTRAINT "AdvancedBooking_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvancedBooking" ADD CONSTRAINT "AdvancedBooking_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstantBooking" ADD CONSTRAINT "InstantBooking_acceptedByBusinessId_fkey" FOREIGN KEY ("acceptedByBusinessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstantBooking" ADD CONSTRAINT "InstantBooking_acceptedByUserId_fkey" FOREIGN KEY ("acceptedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstantBooking" ADD CONSTRAINT "InstantBooking_accessibilityProfileId_fkey" FOREIGN KEY ("accessibilityProfileId") REFERENCES "AccessibilityProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstantBooking" ADD CONSTRAINT "InstantBooking_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstantBooking" ADD CONSTRAINT "InstantBooking_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstantBooking" ADD CONSTRAINT "InstantBooking_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_advancedBookingId_fkey" FOREIGN KEY ("advancedBookingId") REFERENCES "AdvancedBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideSchedule" ADD CONSTRAINT "RideSchedule_advancedBookingId_fkey" FOREIGN KEY ("advancedBookingId") REFERENCES "AdvancedBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RideSchedule" ADD CONSTRAINT "RideSchedule_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_advancedBookingId_fkey" FOREIGN KEY ("advancedBookingId") REFERENCES "AdvancedBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_instantBookingId_fkey" FOREIGN KEY ("instantBookingId") REFERENCES "InstantBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripFeedback" ADD CONSTRAINT "TripFeedback_advancedBookingId_fkey" FOREIGN KEY ("advancedBookingId") REFERENCES "AdvancedBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripFeedback" ADD CONSTRAINT "TripFeedback_instantBookingId_fkey" FOREIGN KEY ("instantBookingId") REFERENCES "InstantBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripFeedback" ADD CONSTRAINT "TripFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_advancedBookingId_fkey" FOREIGN KEY ("advancedBookingId") REFERENCES "AdvancedBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_instantBookingId_fkey" FOREIGN KEY ("instantBookingId") REFERENCES "InstantBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
