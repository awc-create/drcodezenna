-- AlterTable
ALTER TABLE "public"."BlogPost" ADD COLUMN     "notified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."TeachingPost" ADD COLUMN     "notified" BOOLEAN NOT NULL DEFAULT false;
