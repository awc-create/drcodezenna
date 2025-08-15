-- CreateTable
CREATE TABLE "public"."TeachingPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "current" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL,
    "tags" TEXT[],
    "description" TEXT NOT NULL,
    "fullText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeachingPost_pkey" PRIMARY KEY ("id")
);
