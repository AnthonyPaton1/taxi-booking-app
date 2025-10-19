-- AlterTable
ALTER TABLE "DriverCompliance" ALTER COLUMN "ukDrivingLicence" DROP DEFAULT,
ALTER COLUMN "localAuthorityRegistered" DROP DEFAULT,
ALTER COLUMN "dbsChecked" DROP DEFAULT,
ALTER COLUMN "publicLiabilityInsurance" DROP DEFAULT,
ALTER COLUMN "fullyCompInsurance" DROP DEFAULT,
ALTER COLUMN "healthCheckPassed" DROP DEFAULT,
ALTER COLUMN "englishProficiency" DROP DEFAULT;
