-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;
