-- CreateTable
CREATE TABLE "public"."Area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_UserAreas" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserAreas_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Area_name_key" ON "public"."Area"("name");

-- CreateIndex
CREATE INDEX "_UserAreas_B_index" ON "public"."_UserAreas"("B");

-- AddForeignKey
ALTER TABLE "public"."_UserAreas" ADD CONSTRAINT "_UserAreas_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserAreas" ADD CONSTRAINT "_UserAreas_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
