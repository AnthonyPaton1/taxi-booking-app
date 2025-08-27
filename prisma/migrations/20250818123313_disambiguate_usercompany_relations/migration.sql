/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `Bid` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Bid" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "idempotencyKey" TEXT;

-- AlterTable
ALTER TABLE "public"."Company" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."House" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Invoice" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Notification" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."RideRequest" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."RideSchedule" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."TripFeedback" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."UserCompany" ADD COLUMN     "dbsChecked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "insuranceChecked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "plInsuranceChecked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verifiedById" TEXT,
ADD COLUMN     "verifyNotes" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Bid_idempotencyKey_key" ON "public"."Bid"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Bid_deletedAt_idx" ON "public"."Bid"("deletedAt");

-- CreateIndex
CREATE INDEX "Company_deletedAt_idx" ON "public"."Company"("deletedAt");

-- CreateIndex
CREATE INDEX "House_deletedAt_idx" ON "public"."House"("deletedAt");

-- CreateIndex
CREATE INDEX "Invoice_deletedAt_idx" ON "public"."Invoice"("deletedAt");

-- CreateIndex
CREATE INDEX "Notification_deletedAt_idx" ON "public"."Notification"("deletedAt");

-- CreateIndex
CREATE INDEX "RideRequest_companyId_status_pickupTime_idx" ON "public"."RideRequest"("companyId", "status", "pickupTime");

-- CreateIndex
CREATE INDEX "RideRequest_deletedAt_idx" ON "public"."RideRequest"("deletedAt");

-- CreateIndex
CREATE INDEX "RideSchedule_deletedAt_idx" ON "public"."RideSchedule"("deletedAt");

-- CreateIndex
CREATE INDEX "TripFeedback_deletedAt_idx" ON "public"."TripFeedback"("deletedAt");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "public"."User"("deletedAt");

-- CreateIndex
CREATE INDEX "UserCompany_companyId_isVerified_idx" ON "public"."UserCompany"("companyId", "isVerified");

-- CreateIndex
CREATE INDEX "UserCompany_deletedAt_idx" ON "public"."UserCompany"("deletedAt");

-- AddForeignKey
ALTER TABLE "public"."UserCompany" ADD CONSTRAINT "UserCompany_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
