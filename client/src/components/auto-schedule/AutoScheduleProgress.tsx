import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Check, Upload, CalendarClock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import type { ScheduleProgress } from '../../utils/autoScheduleRunner.ts';

interface Props {
  progress: ScheduleProgress;
  carouselMode?: boolean;
}

export default function AutoScheduleProgress({ progress, carouselMode }: Props) {
  const { t } = useTranslation();
  const [errorsOpen, setErrorsOpen] = useState(false);

  useEffect(() => {
    if (progress.phase === 'done' && progress.errors.length > 0) setErrorsOpen(true);
  }, [progress.phase, progress.errors.length]);
  const { phase, videosUploaded, videosFailed, videosTotal, postsCreated, postsFailed, postsTotal, currentAccount, errors } = progress;

  const attempted = postsCreated + postsFailed;
  const percent = phase === 'uploading'
    ? videosTotal > 0 ? ((videosUploaded + videosFailed) / videosTotal) * 50 : 0
    : postsTotal > 0 ? 50 + (attempted / postsTotal) * 50 : 100;

  return (
    <div id="auto-schedule-progress-059" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{t('autoSchedule.progressTitle')}</h3>
        {phase === 'done' ? <Check size={18} className="text-green-500" /> : <Loader2 size={18} className="animate-spin text-primary" />}
      </div>

      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>

      {phase === 'uploading' && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Upload size={16} className="text-blue-500" />
            {t(carouselMode ? 'autoSchedule.uploadingCarousels' : 'autoSchedule.uploadingVideos', { done: videosUploaded, failed: videosFailed, total: videosTotal })}
          </div>
        </div>
      )}

      {phase === 'creating' && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarClock size={16} className="text-purple-500" />
            {t('autoSchedule.creatingPosts', { done: attempted, total: postsTotal })}
          </div>
          {currentAccount && (
            <p className="text-xs text-muted-foreground ml-6">@{currentAccount}</p>
          )}
        </div>
      )}

      {phase === 'done' && (
        <div className="space-y-3">
          <div className={`p-3 rounded-lg border ${postsFailed > 0 || videosFailed > 0 ? 'border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800' : 'border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800'}`}>
            <p className={`text-sm font-medium ${postsFailed > 0 || videosFailed > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-green-700 dark:text-green-400'}`}>
              {t('autoSchedule.resultSummary', { success: postsCreated, error: postsFailed, total: postsTotal })}
            </p>
            {videosFailed > 0 && (
              <p className="text-xs mt-1 text-amber-600 dark:text-amber-500">
                {t('autoSchedule.uploadsFailed', { count: videosFailed })}
              </p>
            )}
          </div>

          {errors.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setErrorsOpen(!errorsOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-muted/50"
              >
                <span className="flex items-center gap-2">
                  <AlertTriangle size={14} />
                  {t('autoSchedule.errorsTitle', { count: errors.length })}
                </span>
                {errorsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {errorsOpen && (
                <div className="max-h-60 overflow-y-auto border-t border-border">
                  {errors.map((e, i) => (
                    <div key={i} className="px-3 py-1.5 text-xs border-b border-border last:border-b-0">
                      <span className="font-medium">{e.video}</span>
                      {e.account && <span className="text-muted-foreground"> @{e.account}</span>}
                      <span className="text-red-500 ml-2">{e.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
