/*
  Warnings:

  - You are about to drop the column `tenants` on the `House` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "House" DROP COLUMN "tenants";

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

-- AddForeignKey
ALTER TABLE "Resident" ADD CONSTRAINT "Resident_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;
