-- AlterTable
ALTER TABLE "public"."Driver" ALTER COLUMN "specificMusic" DROP NOT NULL,
ALTER COLUMN "specificMusic" DROP DEFAULT,
ALTER COLUMN "specificMusic" SET DATA TYPE TEXT;
