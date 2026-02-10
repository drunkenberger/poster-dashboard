import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, Loader2, AlertCircle, Film } from 'lucide-react';
import type { UploadedMedia } from '../../hooks/useMediaUpload.ts';

interface MediaUploaderProps {
  files: UploadedMedia[];
  onUpload: (files: File[]) => void;
  onRemove: (id: string) => void;
}

export default function MediaUploader({ files, onUpload, onRemove }: MediaUploaderProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = Array.from(e.dataTransfer.files);
      if (dropped.length) onUpload(dropped);
    },
    [onUpload],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? []);
      if (selected.length) onUpload(selected);
      e.target.value = '';
    },
    [onUpload],
  );

  return (
    <div id="media-uploader-006" className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
        }`}
      >
        <Upload size={24} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t('media.dragDrop')}</p>
        <p className="text-xs text-muted-foreground">{t('media.supported')}</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,video/mp4,video/quicktime"
        onChange={handleChange}
        className="hidden"
      />

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {files.map((media) => (
            <MediaPreviewItem key={media.id} media={media} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  );
}

function MediaPreviewItem({ media, onRemove }: { media: UploadedMedia; onRemove: (id: string) => void }) {
  const isVideo = media.file.type.startsWith('video/');

  return (
    <div className="relative group rounded-lg overflow-hidden border border-border bg-muted aspect-square">
      {media.preview ? (
        <img src={media.preview} alt={media.file.name} className="w-full h-full object-cover" />
      ) : (
        <div className="flex items-center justify-center w-full h-full">
          <Film size={32} className="text-muted-foreground" />
        </div>
      )}

      {media.status === 'uploading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Loader2 size={24} className="text-white animate-spin" />
        </div>
      )}

      {media.status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
          <AlertCircle size={24} className="text-destructive" />
        </div>
      )}

      <button
        onClick={() => onRemove(media.id)}
        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>

      {isVideo && media.status === 'done' && (
        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[10px] font-medium bg-black/60 text-white rounded">
          VIDEO
        </span>
      )}
    </div>
  );
}
