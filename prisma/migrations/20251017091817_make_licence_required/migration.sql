/*
  Warnings:

  - Made the column `licenceNumber` on table `DriverCompliance` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "DriverCompliance" ALTER COLUMN "licenceNumber" SET NOT NULL;
