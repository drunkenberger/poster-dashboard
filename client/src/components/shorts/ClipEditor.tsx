import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Clock } from 'lucide-react';
import type { VideoClip } from '../../../../shared/types/index.ts';

interface ClipEditorProps {
  currentTime: number;
  clips: VideoClip[];
  onClipsChange: (clips: VideoClip[]) => void;
  duration: number;
}

const MIN_CLIP = 15;
const MAX_CLIP = 60;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function ClipEditor({ currentTime, clips, onClipsChange, duration }: ClipEditorProps) {
  const { t } = useTranslation();
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  const clipDuration = startTime !== null && endTime !== null ? endTime - startTime : 0;
  const isValid = startTime !== null && endTime !== null && clipDuration >= MIN_CLIP && clipDuration <= MAX_CLIP && endTime <= duration;

  const addClip = () => {
    if (!isValid || startTime === null || endTime === null) return;
    const clip: VideoClip = {
      id: crypto.randomUUID(),
      start: Math.round(startTime * 100) / 100,
      end: Math.round(endTime * 100) / 100,
    };
    onClipsChange([...clips, clip]);
    setStartTime(null);
    setEndTime(null);
  };

  const removeClip = (id: string) => {
    onClipsChange(clips.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          id="shorts-clip-setstart-043"
          onClick={() => setStartTime(currentTime)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-muted transition-colors"
        >
          <Clock size={14} />
          {t('shorts.setStart')} {startTime !== null && <span className="font-mono text-xs text-primary">{formatTime(startTime)}</span>}
        </button>

        <button
          id="shorts-clip-setend-044"
          onClick={() => setEndTime(currentTime)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-muted transition-colors"
        >
          <Clock size={14} />
          {t('shorts.setEnd')} {endTime !== null && <span className="font-mono text-xs text-primary">{formatTime(endTime)}</span>}
        </button>

        {startTime !== null && endTime !== null && (
          <span className={`text-xs font-mono ${clipDuration < MIN_CLIP || clipDuration > MAX_CLIP ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
            {clipDuration.toFixed(1)}s {clipDuration < MIN_CLIP ? `(min ${MIN_CLIP}s)` : clipDuration > MAX_CLIP ? `(max ${MAX_CLIP}s)` : ''}
          </span>
        )}

        <button
          id="shorts-clip-add-045"
          onClick={addClip}
          disabled={!isValid}
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-colors"
        >
          <Plus size={14} /> {t('shorts.addClip')}
        </button>
      </div>

      {clips.length > 0 && (
        <div id="shorts-clip-list-046" className="space-y-2">
          <p className="text-sm font-medium text-foreground">{t('shorts.clipsList')} ({clips.length})</p>
          {clips.map((clip, i) => (
            <div
              key={clip.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground w-6">#{i + 1}</span>
                <span className="text-sm font-mono">{formatTime(clip.start)} - {formatTime(clip.end)}</span>
                <span className="text-xs text-muted-foreground">{(clip.end - clip.start).toFixed(1)}s</span>
              </div>
              <button onClick={() => removeClip(clip.id)} className="p-1 text-muted-foreground hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
