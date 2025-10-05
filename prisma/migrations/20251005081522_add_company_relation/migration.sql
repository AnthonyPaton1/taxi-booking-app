-- AlterTable
ALTER TABLE "AdvancedBooking" ADD COLUMN     "initials" TEXT[];

-- AlterTable
ALTER TABLE "House" ADD COLUMN     "companyId" TEXT;

-- AlterTable
ALTER TABLE "InstantBooking" ADD COLUMN     "initials" TEXT[];

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
