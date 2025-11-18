/*
  Warnings:

  - You are about to drop the column `serviceAreaLat` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `serviceAreaLng` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `serviceAreaRadius` on the `Driver` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Driver_serviceAreaLat_serviceAreaLng_idx";

-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "serviceAreaLat",
DROP COLUMN "serviceAreaLng",
DROP COLUMN "serviceAreaRadius";
