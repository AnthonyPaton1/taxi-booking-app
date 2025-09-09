-- CreateEnum
CREATE TYPE "public"."RequestType" AS ENUM ('PUBLIC', 'BUSINESS');

-- AlterTable
ALTER TABLE "public"."Incident" ADD COLUMN     "evidenceUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."RideRequest" ADD COLUMN     "passengerCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "type" "public"."RequestType" NOT NULL DEFAULT 'BUSINESS',
ADD COLUMN     "wheelchairUsers" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "companyId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "pickupTime" TEXT NOT NULL,
    "returnTime" TEXT,
    "roundTrip" BOOLEAN NOT NULL,
    "passengerCount" INTEGER NOT NULL,
    "wheelchairUsers" INTEGER NOT NULL,
    "specialNeeds" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
