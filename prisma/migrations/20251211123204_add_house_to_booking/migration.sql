-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "houseId" TEXT;

-- CreateIndex
CREATE INDEX "Booking_houseId_status_deletedAt_idx" ON "Booking"("houseId", "status", "deletedAt");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE SET NULL ON UPDATE CASCADE;
