-- CreateTable
CREATE TABLE "user_email_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookingAvailable" BOOLEAN NOT NULL DEFAULT true,
    "bidAccepted" BOOLEAN NOT NULL DEFAULT true,
    "bookingAssigned" BOOLEAN NOT NULL DEFAULT true,
    "bookingCancelled" BOOLEAN NOT NULL DEFAULT true,
    "paymentReceived" BOOLEAN NOT NULL DEFAULT true,
    "tripReminders" BOOLEAN NOT NULL DEFAULT true,
    "systemUpdates" BOOLEAN NOT NULL DEFAULT false,
    "emailDigest" BOOLEAN NOT NULL DEFAULT false,
    "digestTime" TEXT NOT NULL DEFAULT '09:00',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_email_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_preferences_userId_key" ON "user_email_preferences"("userId");

-- AddForeignKey
ALTER TABLE "user_email_preferences" ADD CONSTRAINT "user_email_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
