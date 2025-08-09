/*
  Warnings:

  - You are about to drop the column `heading` on the `HeroSection` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `HeroSection` table. All the data in the column will be lost.
  - You are about to drop the column `subheading` on the `HeroSection` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `HeroSection` table. All the data in the column will be lost.
  - Added the required column `image` to the `HeroSection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtitles` to the `HeroSection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."HeroSection" DROP COLUMN "heading",
DROP COLUMN "imageUrl",
DROP COLUMN "subheading",
DROP COLUMN "updatedAt",
ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "subtitles" JSONB NOT NULL;
