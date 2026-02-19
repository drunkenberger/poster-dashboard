import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Scissors, Loader2, Check, AlertCircle, Layers, Film, PenSquare } from 'lucide-react';
import VideoUploader from '../components/shorts/VideoUploader.tsx';
import SavedClips from '../components/shorts/SavedClips.tsx';
import { useShortsStore } from '../stores/shortsStore.ts';
import * as videosService from '../services/videos.ts';
import type { AutoCutResult } from '../services/videos.ts';
import type { VideoAnalysis, DriveVideo, BulkPostItem } from '../../../shared/types/index.ts';
import { saveClipsForBulk } from '../utils/shortsStorage.ts';

type Phase = 'upload' | 'analyzing' | 'cutting' | 'done' | 'error';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function ShortsEditor() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const addBatch = useShortsStore((s) => s.addBatch);

  const [phase, setPhase] = useState<Phase>('upload');
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [clips, setClips] = useState<AutoCutResult[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const processVideo = async (videoId: string, filename: string) => {
    setPhase('cutting');
    try {
      const result = await videosService.autoCut(videoId, 30);
      setClips(result.clips);

      addBatch(
        filename,
        result.clips.map((c) => ({
          clipId: c.clipId,
          mediaId: c.mediaId,
          name: c.name,
          start: c.start,
          end: c.end,
          duration: c.duration,
          captionEs: c.captionEs || '',
          captionEn: c.captionEn || '',
          title: c.title || '',
        })),
      );

      setPhase('done');
    } catch {
      setErrorMsg(t('shorts.cutError'));
      setPhase('error');
    }
  };

  const handleAnalysis = async (a: VideoAnalysis) => {
    setAnalysis(a);
    await processVideo(a.videoId, a.filename);
  };

  const handleUploadLocal = async (file: File) => {
    setPhase('analyzing');
    try {
      const a = await videosService.uploadVideo(file);
      await handleAnalysis(a);
    } catch {
      setErrorMsg(t('shorts.uploadError'));
      setPhase('error');
    }
  };

  const handleSelectDrive = async (video: DriveVideo) => {
    setPhase('analyzing');
    try {
      const a = await videosService.uploadFromDrive(video.id);
      await handleAnalysis(a);
    } catch {
      setErrorMsg(t('shorts.uploadError'));
      setPhase('error');
    }
  };

  const goToBulk = () => {
    const items: BulkPostItem[] = clips.map((c) => ({
      id: c.clipId,
      mediaId: c.mediaId,
      name: c.name,
      caption: '',
      captionEs: c.captionEs,
      captionEn: c.captionEn,
      title: c.title,
    }));
    saveClipsForBulk(items);
    navigate('/bulk');
  };

  const goToCreate = (clip: AutoCutResult) => {
    const caption = i18n.language === 'es' ? clip.captionEs : clip.captionEn;
    navigate(`/create?media=${clip.mediaId}&caption=${encodeURIComponent(caption || clip.title)}`);
  };

  const reset = () => {
    if (analysis) videosService.deleteVideo(analysis.videoId).catch(() => {});
    setPhase('upload');
    setAnalysis(null);
    setClips([]);
    setErrorMsg('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Scissors size={24} /> {t('shorts.title')}
      </h2>

      {phase === 'upload' && (
        <>
          <VideoUploader
            onAnalysis={handleAnalysis}
            uploading={false}
            onUploadLocal={handleUploadLocal}
            onSelectDrive={handleSelectDrive}
          />
          <SavedClips />
        </>
      )}

      {(phase === 'analyzing' || phase === 'cutting') && (
        <div id="shorts-cut-progress-048" className="flex flex-col items-center gap-4 py-16">
          <Loader2 size={40} className="animate-spin text-primary" />
          <p className="text-lg font-medium">
            {phase === 'analyzing' ? t('shorts.analyzing') : t('shorts.cuttingAuto')}
          </p>
          <p className="text-sm text-muted-foreground">
            {phase === 'analyzing' ? t('shorts.analyzingDesc') : t('shorts.cuttingAutoDesc')}
          </p>
        </div>
      )}

      {phase === 'error' && (
        <div className="flex flex-col items-center gap-4 py-16">
          <AlertCircle size={40} className="text-red-500" />
          <p className="text-sm text-red-500">{errorMsg}</p>
          <button onClick={reset} className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted">
            {t('shorts.tryAgain')}
          </button>
        </div>
      )}

      {phase === 'done' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
            <Check size={20} className="text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              {t('shorts.doneMessage', { count: clips.length })}
            </span>
          </div>

          <div id="shorts-clip-list-046" className="space-y-2">
            {clips.map((clip) => (
              <div key={clip.clipId} className="p-3 rounded-lg border border-border bg-card space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Film size={16} className="text-muted-foreground" />
                    <span className="text-sm font-medium">{clip.name}</span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {formatTime(clip.start)} - {formatTime(clip.end)}
                    </span>
                    <span className="text-xs text-muted-foreground">{Math.round(clip.duration)}s</span>
                  </div>
                  <button
                    onClick={() => goToCreate(clip)}
                    className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-border hover:bg-muted transition-colors"
                  >
                    <PenSquare size={12} /> {t('shorts.postSingle')}
                  </button>
                </div>
                {clip.title && (
                  <p className="text-xs text-muted-foreground pl-7 truncate">{clip.title}</p>
                )}
              </div>
            ))}
          </div>

          <button
            id="shorts-cut-btn-047"
            onClick={goToBulk}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90"
          >
            <Layers size={16} /> {t('shorts.goToBulk', { count: clips.length })}
          </button>

          <button onClick={reset} className="text-sm text-muted-foreground hover:text-foreground">
            {t('shorts.processAnother')}
          </button>
        </div>
      )}
    </div>
  );
}
