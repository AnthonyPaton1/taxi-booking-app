/*
  Warnings:

  - You are about to drop the column `pin` on the `House` table. All the data in the column will be lost.
  - Added the required column `password` to the `House` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "House" DROP COLUMN "pin",
ADD COLUMN     "password" TEXT NOT NULL;
