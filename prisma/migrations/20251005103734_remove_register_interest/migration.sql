/*
  Warnings:

  - You are about to drop the `RegisterInterest` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "companyName" TEXT;

-- DropTable
DROP TABLE "public"."RegisterInterest";
