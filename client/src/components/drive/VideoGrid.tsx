import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Film, Upload, Loader2, CheckCircle } from 'lucide-react';
import type { DriveVideo } from '../../../../shared/types/index.ts';
import { driveService } from '../../services/drive.ts';

interface VideoGridProps {
  videos: DriveVideo[];
  onUploaded: (mediaId: string, captionEs: string, captionEn: string, title: string) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VideoGrid({ videos, onUploaded }: VideoGridProps) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<Set<string>>(new Set());

  if (videos.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">{t('drive.noVideos')}</p>;
  }

  const handleUpload = async (video: DriveVideo) => {
    if (uploading || uploaded.has(video.id)) return;
    setUploading(video.id);
    try {
      const { media_id } = await driveService.uploadFromDrive(video.id);
      setUploaded((prev) => new Set(prev).add(video.id));
      onUploaded(media_id, video.captionEs ?? '', video.captionEn ?? '', video.title ?? '');
    } catch {
      // error handled by api interceptor
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video) => {
        const isUploading = uploading === video.id;
        const isDone = uploaded.has(video.id);

        return (
          <div
            key={video.id}
            id={`drive-video-${video.id}`}
            className="rounded-lg border border-border bg-card overflow-hidden"
          >
            <div className="aspect-video bg-muted flex items-center justify-center">
              {video.thumbnailLink ? (
                <img src={video.thumbnailLink} alt={video.name} className="w-full h-full object-cover" />
              ) : (
                <Film size={40} className="text-muted-foreground" />
              )}
            </div>

            <div className="p-3 space-y-2">
              <p className="text-sm font-medium text-foreground truncate" title={video.name}>
                {video.name}
              </p>
              <p className="text-xs text-muted-foreground">{formatSize(video.size)}</p>

              {video.title && (
                <p className="text-xs font-medium text-primary truncate" title={video.title}>
                  {video.title}
                </p>
              )}

              {video.captionEs && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="line-clamp-2 whitespace-pre-line">
                    <span className="font-medium text-foreground">ES:</span> {video.captionEs}
                  </p>
                  <p className="line-clamp-2 whitespace-pre-line">
                    <span className="font-medium text-foreground">EN:</span> {video.captionEn}
                  </p>
                </div>
              )}

              <button
                onClick={() => handleUpload(video)}
                disabled={isUploading || isDone}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:opacity-90"
              >
                {isUploading && <Loader2 size={14} className="animate-spin" />}
                {isDone && <CheckCircle size={14} />}
                {!isUploading && !isDone && <Upload size={14} />}
                {isUploading ? t('drive.uploading') : isDone ? t('drive.uploaded') : t('drive.useVideo')}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
