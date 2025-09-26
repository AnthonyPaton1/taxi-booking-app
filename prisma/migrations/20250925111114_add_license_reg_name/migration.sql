/*
  Warnings:

  - Added the required column `licenceNumber` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Driver` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Driver" ADD COLUMN     "licenceNumber" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;
