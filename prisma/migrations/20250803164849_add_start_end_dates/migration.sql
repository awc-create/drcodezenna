/*
  Warnings:

  - You are about to drop the column `current` on the `TeachingPost` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."TeachingPost" DROP COLUMN "current",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "isCurrent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
