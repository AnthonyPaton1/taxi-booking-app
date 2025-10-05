/*
  Warnings:

  - You are about to drop the column `companyName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."House" DROP CONSTRAINT "House_companyId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "companyName";

-- DropTable
DROP TABLE "public"."Company";
