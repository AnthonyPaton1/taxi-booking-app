-- DropIndex
DROP INDEX "AdvancedBooking_bidDeadline_idx";

-- DropIndex
DROP INDEX "AdvancedBooking_businessId_pickupTime_idx";

-- DropIndex
DROP INDEX "AdvancedBooking_deletedAt_idx";

-- DropIndex
DROP INDEX "AdvancedBooking_status_pickupTime_idx";

-- DropIndex
DROP INDEX "Driver_gender_idx";

-- DropIndex
DROP INDEX "Driver_hasWAV_idx";

-- DropIndex
DROP INDEX "Driver_localPostcode_approved_idx";

-- DropIndex
DROP INDEX "InstantBooking_driverId_idx";

-- DropIndex
DROP INDEX "InstantBooking_status_pickupTime_idx";

-- AlterTable
ALTER TABLE "AccessibilityProfile" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "DriverCompliance" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "InstantBooking" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "AccessibilityProfile_wheelchairAccess_femaleDriverOnly_idx" ON "AccessibilityProfile"("wheelchairAccess", "femaleDriverOnly");

-- CreateIndex
CREATE INDEX "AccessibilityProfile_assistanceAnimal_idx" ON "AccessibilityProfile"("assistanceAnimal");

-- CreateIndex
CREATE INDEX "AccessibilityProfile_deletedAt_idx" ON "AccessibilityProfile"("deletedAt");

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
CREATE INDEX "Bid_status_createdAt_idx" ON "Bid"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Business_adminUserId_idx" ON "Business"("adminUserId");

-- CreateIndex
CREATE INDEX "Business_lat_lng_idx" ON "Business"("lat", "lng");

-- CreateIndex
CREATE INDEX "Business_postcode_idx" ON "Business"("postcode");

-- CreateIndex
CREATE INDEX "Business_deletedAt_idx" ON "Business"("deletedAt");

-- CreateIndex
CREATE INDEX "Driver_approved_suspended_deletedAt_hasWAV_idx" ON "Driver"("approved", "suspended", "deletedAt", "hasWAV");

-- CreateIndex
CREATE INDEX "Driver_baseLat_baseLng_idx" ON "Driver"("baseLat", "baseLng");

-- CreateIndex
CREATE INDEX "Driver_userId_idx" ON "Driver"("userId");

-- CreateIndex
CREATE INDEX "Driver_accessibilityProfileId_idx" ON "Driver"("accessibilityProfileId");

-- CreateIndex
CREATE INDEX "DriverCompliance_driverId_idx" ON "DriverCompliance"("driverId");

-- CreateIndex
CREATE INDEX "DriverCompliance_nextDbsCheckDue_deletedAt_idx" ON "DriverCompliance"("nextDbsCheckDue", "deletedAt");

-- CreateIndex
CREATE INDEX "DriverCompliance_dbsStatus_idx" ON "DriverCompliance"("dbsStatus");

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
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_deletedAt_idx" ON "User"("role", "deletedAt");
