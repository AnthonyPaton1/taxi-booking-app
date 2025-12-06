/*
  Warnings:

  - A unique constraint covering the columns `[paypalSubscriptionId]` on the table `Driver` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "isSubscribed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastPaymentDate" TIMESTAMP(3),
ADD COLUMN     "paypalPlanId" TEXT,
ADD COLUMN     "paypalSubscriptionId" TEXT,
ADD COLUMN     "subscriptionExpiresAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionStartDate" TIMESTAMP(3),
ADD COLUMN     "subscriptionTier" TEXT NOT NULL DEFAULT 'STANDARD';

-- CreateIndex
CREATE UNIQUE INDEX "Driver_paypalSubscriptionId_key" ON "Driver"("paypalSubscriptionId");
