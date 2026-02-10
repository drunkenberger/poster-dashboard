import { useState, useCallback } from 'react';
import { mediaService } from '../services/media.ts';

export interface UploadedMedia {
  id: string;
  file: File;
  preview: string;
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'video/mp4', 'video/quicktime'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export function useMediaUpload() {
  const [files, setFiles] = useState<UploadedMedia[]>([]);

  const upload = useCallback(async (fileList: File[]) => {
    const valid = fileList.filter((f) => {
      if (!ACCEPTED_TYPES.includes(f.type)) return false;
      if (f.size > MAX_FILE_SIZE) return false;
      return true;
    });

    const pending: UploadedMedia[] = valid.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : '',
      status: 'uploading' as const,
    }));

    setFiles((prev) => [...prev, ...pending]);

    const results = await Promise.allSettled(
      pending.map(async (item) => {
        try {
          const mediaId = await mediaService.uploadFile(item.file);
          setFiles((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, id: mediaId, status: 'done' as const } : f)),
          );
          return mediaId;
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Upload failed';
          setFiles((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, status: 'error' as const, error: msg } : f)),
          );
          throw err;
        }
      }),
    );

    return results
      .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
      .map((r) => r.value);
  }, []);

  const remove = useCallback((id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clear = useCallback(() => {
    files.forEach((f) => { if (f.preview) URL.revokeObjectURL(f.preview); });
    setFiles([]);
  }, [files]);

  const mediaIds = files.filter((f) => f.status === 'done').map((f) => f.id);

  return { files, upload, remove, clear, mediaIds };
}
