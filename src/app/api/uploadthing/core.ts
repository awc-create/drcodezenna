import { createUploadthing, type FileRouter } from 'uploadthing/server';
import { prisma } from '@/lib/prisma';

const f = createUploadthing();

export const ourFileRouter = {
  mediaUploader: f({ image: { maxFileSize: '4MB' } }).onUploadComplete(async ({ file }) => {
    try {
      // Check by URL to avoid exact duplicate rows
      const existing = await prisma.media.findFirst({ where: { url: file.url } });
      if (existing) {
        console.warn('⚠️ File already exists in DB:', file.url);
        return { success: true as const, skipped: true as const };
      }

      const newEntry = await prisma.media.create({
        data: {
          name: file.name ?? 'untitled',
          url: file.url,
          size: typeof file.size === 'number' ? file.size : Number(file.size) || 0,
          type: file.type ?? 'unknown',
        },
      });

      // Remove older entries with same name (keep latest)
      await prisma.media.deleteMany({
        where: { name: file.name ?? 'untitled', NOT: { id: newEntry.id } },
      });

      console.info(`✅ Uploaded and cleaned duplicates for: ${file.name}`); // ✅ lint-safe
      return { success: true as const, skipped: false as const };
    } catch (err: unknown) {
      console.error('❌ UploadThing DB error:', err);
      return { success: false as const };
    }
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
