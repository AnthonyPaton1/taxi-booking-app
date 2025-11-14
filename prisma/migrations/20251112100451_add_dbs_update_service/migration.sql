-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "suspended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "suspendedBy" TEXT,
ADD COLUMN     "suspendedDate" TIMESTAMP(3),
ADD COLUMN     "suspendedReason" TEXT;

-- AlterTable
ALTER TABLE "DriverCompliance" ADD COLUMN     "dbsCheckedBy" TEXT,
ADD COLUMN     "dbsIssueDate" TIMESTAMP(3),
ADD COLUMN     "dbsStatus" TEXT,
ADD COLUMN     "dbsUpdateServiceConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dbsUpdateServiceConsentDate" TIMESTAMP(3),
ADD COLUMN     "dbsUpdateServiceNumber" TEXT,
ADD COLUMN     "lastDbsCheck" TIMESTAMP(3),
ADD COLUMN     "nextDbsCheckDue" TIMESTAMP(3);
