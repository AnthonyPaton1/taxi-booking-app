-- CreateTable
CREATE TABLE "public"."Incident" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "emergency" BOOLEAN NOT NULL,
    "actionsTaken" TEXT,
    "followUp" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "houseId" TEXT,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Incident" ADD CONSTRAINT "Incident_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Incident" ADD CONSTRAINT "Incident_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Incident" ADD CONSTRAINT "Incident_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "public"."House"("id") ON DELETE SET NULL ON UPDATE CASCADE;
