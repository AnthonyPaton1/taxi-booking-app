/*
  Warnings:

  - A unique constraint covering the columns `[internalId]` on the table `House` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[loginName]` on the table `House` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `internalId` to the `House` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loginName` to the `House` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pin` to the `House` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."Role" ADD VALUE 'SUPER_ADMIN';
ALTER TYPE "public"."Role" ADD VALUE 'COMPANY_ADMIN';

-- AlterTable
ALTER TABLE "public"."House" ADD COLUMN     "internalId" TEXT NOT NULL,
ADD COLUMN     "loginName" TEXT NOT NULL,
ADD COLUMN     "pin" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "House_internalId_key" ON "public"."House"("internalId");

-- CreateIndex
CREATE UNIQUE INDEX "House_loginName_key" ON "public"."House"("loginName");
