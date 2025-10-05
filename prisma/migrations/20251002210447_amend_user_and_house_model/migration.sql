-- DropForeignKey
ALTER TABLE "public"."House" DROP CONSTRAINT "House_managerId_fkey";

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
