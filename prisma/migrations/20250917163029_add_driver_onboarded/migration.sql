/*
  Warnings:

  - You are about to drop the column `licenseNumber` on the `Driver` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Driver" DROP COLUMN "licenseNumber",
ADD COLUMN     "amenities" TEXT[],
ADD COLUMN     "dbsChecked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "englishProficiency" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fullyCompInsurance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "healthCheckPassed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "localAuthorityRegistered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publicLiabilityInsurance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ukDrivingLicence" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "coordinatorOnboarded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "driverOnboarded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "managerOnboarded" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."RegisterInterest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "type" TEXT NOT NULL,
    "message" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegisterInterest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegisterInterest_email_key" ON "public"."RegisterInterest"("email");
