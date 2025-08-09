'use client';

import { useState } from 'react';
import { UploadDropzone } from '@/utils/uploadthing';
import type { inferUploadDropzoneComponentProps } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';
import styles from './ImageUploader.module.scss';
import { toast } from 'sonner';

type Props = {
  onUpload: (url: string) => void;
};

// Infer the UploadDropzone prop types from your router
type DropzoneProps = inferUploadDropzoneComponentProps<OurFileRouter>;
// Get the type of the completion callback param (the array of uploaded files)
type OnComplete = NonNullable<DropzoneProps['onClientUploadComplete']>;
type UploadCompletePayload = Parameters<OnComplete>[0];

export default function ImageUploader({ onUpload }: Props) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className={styles.container}>
      <UploadDropzone
        endpoint="mediaUploader"
        onUploadBegin={() => {
          setIsUploading(true);
          toast.message('Uploading image...');
        }}
        onClientUploadComplete={(res: UploadCompletePayload) => {
          setIsUploading(false);
          toast.dismiss();

          const first = Array.isArray(res) ? res[0] : undefined;
          if (first?.url) {
            toast.success('Upload complete');
            onUpload(first.url);
          } else {
            toast.error('Upload finished but no URL returned');
          }
        }}
        onUploadError={(err: { message?: string; existingUrl?: string }) => {
          console.error('Upload error:', err);

          if (err?.existingUrl) {
            toast.info('This image already exists — using saved version.');
            onUpload(err.existingUrl);
          } else {
            toast.error(err?.message || 'Upload failed');
          }
        }}
        appearance={{
          container: styles.uploadBox,
          uploadIcon: styles.uploadIcon,
          button: styles.uploadButton,
        }}
      />

      {isUploading && <p className={styles.loadingText}>Uploading...</p>}
    </div>
  );
}
