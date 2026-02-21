import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Film, PenSquare, Layers, Trash2, Clock } from 'lucide-react';
import { useShortsStore, type ClipBatch } from '../../stores/shortsStore.ts';
import { saveClipsForBulk } from '../../utils/shortsStorage.ts';
import type { BulkPostItem } from '../../../../shared/types/index.ts';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function BatchCard({ batch }: { batch: ClipBatch }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { removeBatch, removeClip } = useShortsStore();

  const goToCreate = (clip: typeof batch.clips[0]) => {
    navigate(`/create?media=${clip.mediaId}`);
  };

  const goToBulk = () => {
    const items: BulkPostItem[] = batch.clips.map((c) => ({
      id: c.clipId,
      mediaId: c.mediaId,
      name: c.name,
      caption: '',
    }));
    saveClipsForBulk(items);
    navigate('/bulk');
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Film size={14} className="text-muted-foreground" />
          <span className="font-medium truncate max-w-48">{batch.sourceFilename}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock size={12} /> {formatDate(batch.createdAt)}
          </span>
        </div>
        <button
          onClick={() => removeBatch(batch.id)}
          className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
          title={t('common.delete')}
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="space-y-1.5">
        {batch.clips.map((clip) => (
          <div key={clip.clipId} className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/50">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-medium">{clip.name}</span>
              <span className="text-xs font-mono text-muted-foreground">
                {formatTime(clip.start)}-{formatTime(clip.end)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToCreate(clip)}
                className="flex items-center gap-1 px-2 py-0.5 text-xs rounded border border-border hover:bg-muted transition-colors"
              >
                <PenSquare size={10} /> {t('shorts.postSingle')}
              </button>
              <button
                onClick={() => removeClip(batch.id, clip.clipId)}
                className="p-0.5 text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Trash2 size={10} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={goToBulk}
        className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90"
      >
        <Layers size={14} /> {t('shorts.goToBulk', { count: batch.clips.length })}
      </button>
    </div>
  );
}

export default function SavedClips() {
  const { t } = useTranslation();
  const { batches, clearAll } = useShortsStore();

  if (batches.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('shorts.savedClips')}</h3>
        <button
          onClick={clearAll}
          className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
        >
          {t('shorts.clearAll')}
        </button>
      </div>

      <div className="space-y-3">
        {batches.map((batch) => (
          <BatchCard key={batch.id} batch={batch} />
        ))}
      </div>
    </div>
  );
}
