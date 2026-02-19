import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause } from 'lucide-react';
import { getStreamUrl } from '../../services/videos.ts';
import type { VideoScene } from '../../../../shared/types/index.ts';

interface VideoPlayerProps {
  videoId: string;
  scenes: VideoScene[];
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  playing: boolean;
  onTogglePlay: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function VideoPlayer({ videoId, scenes, currentTime, onTimeUpdate, playing, onTogglePlay }: VideoPlayerProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const duration = videoRef.current?.duration ?? 0;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const handler = () => onTimeUpdate(el.currentTime);
    el.addEventListener('timeupdate', handler);
    return () => el.removeEventListener('timeupdate', handler);
  }, [onTimeUpdate]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (playing) el.play().catch(() => {});
    else el.pause();
  }, [playing]);

  const seekTo = (time: number) => {
    if (videoRef.current) videoRef.current.currentTime = time;
  };

  return (
    <div className="space-y-3">
      <div id="shorts-player-040" className="relative rounded-lg overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={getStreamUrl(videoId)}
          className="w-full max-h-[400px] object-contain"
          preload="metadata"
          onClick={onTogglePlay}
        />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onTogglePlay} className="p-2 rounded-md hover:bg-muted text-foreground">
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <span id="shorts-time-display-041" className="text-sm font-mono text-muted-foreground">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {scenes.length > 0 && (
        <div id="shorts-scene-markers-042" className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">{t('shorts.scenes')}</p>
          <div className="flex flex-wrap gap-1.5">
            {scenes.map((scene, i) => (
              <button
                key={i}
                onClick={() => seekTo(scene.start)}
                className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                  currentTime >= scene.start && currentTime < scene.end
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {formatTime(scene.start)} - {formatTime(scene.end)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
