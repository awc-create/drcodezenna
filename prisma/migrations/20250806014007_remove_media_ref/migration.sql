/*
  Warnings:

  - You are about to drop the column `mediaId` on the `BlogPost` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."BlogPost" DROP CONSTRAINT "BlogPost_mediaId_fkey";

-- AlterTable
ALTER TABLE "public"."BlogPost" DROP COLUMN "mediaId";
