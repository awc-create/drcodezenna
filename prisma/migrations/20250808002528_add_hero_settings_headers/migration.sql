/*
  Warnings:

  - You are about to drop the column `subtitles` on the `HeroSection` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `HeroSection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."HeroSection" DROP COLUMN "subtitles",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."HeroSubtitle" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "heroId" TEXT NOT NULL,

    CONSTRAINT "HeroSubtitle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HeroBio" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "heroId" TEXT NOT NULL,

    CONSTRAINT "HeroBio_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."HeroSubtitle" ADD CONSTRAINT "HeroSubtitle_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "public"."HeroSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HeroBio" ADD CONSTRAINT "HeroBio_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "public"."HeroSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
