-- DropIndex
DROP INDEX "Notification_deletedAt_idx";

-- DropIndex
DROP INDEX "Notification_userId_createdAt_idx";

-- CreateIndex
CREATE INDEX "Notification_userId_deletedAt_createdAt_idx" ON "Notification"("userId", "deletedAt", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_deletedAt_idx" ON "Notification"("userId", "readAt", "deletedAt");
