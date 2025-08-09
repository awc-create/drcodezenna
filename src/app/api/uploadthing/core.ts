// src/app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/server";
import { db } from "@/lib/db";

const f = createUploadthing();

export const ourFileRouter = {
  mediaUploader: f({ image: { maxFileSize: "4MB" } }).onUploadComplete(async ({ file }) => {
    try {
      // ✅ Check if this file already exists in the DB by URL
      const existing = await db.media.findFirst({
        where: {
          url: file.url,
        },
      });

      if (existing) {
        console.log("⚠️ File already exists in DB:", file.url);
        return { success: true, skipped: true };
      }

      // ✅ Add to DB if new
      const newEntry = await db.media.create({
        data: {
          name: file.name ?? "untitled",
          url: file.url,
          size: Number(file.size) || 0,
          type: file.type ?? "unknown",
        },
      });

      // 🧹 Remove all *older* entries with the same name
      await db.media.deleteMany({
        where: {
          name: file.name,
          NOT: {
            id: newEntry.id,
          },
        },
      });

      console.log(`✅ Uploaded and cleaned duplicates for: ${file.name}`);
      return { success: true, skipped: false };
    } catch (err) {
      console.error("❌ UploadThing DB error:", err);
      return { success: false };
    }
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
