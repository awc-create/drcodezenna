'use client';

import { useState } from 'react';
import { UploadDropzone } from '@/utils/uploadthing';
import styles from './ImageUploader.module.scss';
import { toast } from 'sonner';

type Props = {
  onUpload: (url: string) => void;
};

// Derive prop types directly from the generated component
type DropzoneProps = React.ComponentProps<typeof UploadDropzone>;
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
          const url = (first as { url?: string } | undefined)?.url;

          if (url) {
            toast.success('Upload complete');
            onUpload(url);
          } else {
            toast.error('Upload finished but no URL returned');
          }
        }}
        onUploadError={(err: unknown) => {
          console.error('Upload error:', err);

          const existingUrl =
            typeof (err as { existingUrl?: unknown }).existingUrl === 'string'
              ? (err as { existingUrl: string }).existingUrl
              : undefined;

          if (existingUrl) {
            toast.info('This image already exists — using saved version.');
            onUpload(existingUrl);
          } else {
            const message =
              typeof (err as { message?: unknown }).message === 'string'
                ? (err as { message: string }).message
                : 'Upload failed';
            toast.error(message);
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
