/*
  Warnings:

  - You are about to drop the column `key` on the `Media` table. All the data in the column will be lost.
  - Added the required column `name` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Media_key_key";

-- AlterTable
ALTER TABLE "public"."Media" DROP COLUMN "key",
ADD COLUMN     "name" TEXT NOT NULL;
