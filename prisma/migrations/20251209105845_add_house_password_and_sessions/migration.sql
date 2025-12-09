-- CreateTable
CREATE TABLE "HouseSession" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HouseSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HouseSession_token_key" ON "HouseSession"("token");

-- CreateIndex
CREATE INDEX "HouseSession_houseId_idx" ON "HouseSession"("houseId");

-- AddForeignKey
ALTER TABLE "HouseSession" ADD CONSTRAINT "HouseSession_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;
