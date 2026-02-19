import { useTranslation } from 'react-i18next';
import type { BulkPostItem } from '../../../../shared/types/index.ts';

type ScheduleMode = 'now' | 'interval' | 'manual';

interface BulkSchedulerProps {
  items: BulkPostItem[];
  onItemsChange: (items: BulkPostItem[]) => void;
  scheduleMode: ScheduleMode;
  onScheduleModeChange: (mode: ScheduleMode) => void;
  startTime: string;
  onStartTimeChange: (t: string) => void;
  interval: number;
  onIntervalChange: (h: number) => void;
}

const INTERVALS = [1, 2, 4, 6, 12, 24];

export default function BulkScheduler({
  items, onItemsChange, scheduleMode, onScheduleModeChange,
  startTime, onStartTimeChange, interval, onIntervalChange,
}: BulkSchedulerProps) {
  const { t } = useTranslation();

  const computeDates = (start: string, gap: number): string[] => {
    const base = new Date(start);
    return items.map((_, i) => new Date(base.getTime() + i * gap * 3600000).toISOString());
  };

  const handleIntervalChange = (start: string, gap: number) => {
    if (!start) return;
    const dates = computeDates(start, gap);
    onItemsChange(items.map((item, i) => ({ ...item, scheduledAt: dates[i] })));
  };

  const handleStartChange = (v: string) => {
    onStartTimeChange(v);
    if (v) handleIntervalChange(v, interval);
  };

  const handleGapChange = (v: number) => {
    onIntervalChange(v);
    if (startTime) handleIntervalChange(startTime, v);
  };

  const handleManualChange = (id: string, datetime: string) => {
    onItemsChange(items.map((item) => (item.id === id ? { ...item, scheduledAt: datetime ? new Date(datetime).toISOString() : undefined } : item)));
  };

  return (
    <div id="bulk-scheduler-033" className="space-y-4">
      <div className="flex gap-2">
        {(['now', 'interval', 'manual'] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              onScheduleModeChange(m);
              if (m === 'now') onItemsChange(items.map((item) => ({ ...item, scheduledAt: undefined })));
            }}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              scheduleMode === m ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(`bulk.schedule_${m}`)}
          </button>
        ))}
      </div>

      {scheduleMode === 'interval' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-muted-foreground">{t('bulk.startTime')}</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => handleStartChange(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{t('bulk.interval')}</label>
              <select
                value={interval}
                onChange={(e) => handleGapChange(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm"
              >
                {INTERVALS.map((h) => (
                  <option key={h} value={h}>{h}h</option>
                ))}
              </select>
            </div>
          </div>

          {startTime && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">{t('bulk.preview')}</span>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {items.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono w-6 text-right">{i + 1}.</span>
                    <span className="truncate flex-1">{item.name}</span>
                    <span className="font-mono">{item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : '-'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {scheduleMode === 'manual' && (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-6 text-right">{i + 1}.</span>
              <span className="text-sm truncate flex-1">{item.name}</span>
              <input
                type="datetime-local"
                value={item.scheduledAt ? toLocalDatetime(item.scheduledAt) : ''}
                onChange={(e) => handleManualChange(item.id, e.target.value)}
                className="px-3 py-1.5 rounded-md border border-border bg-background text-foreground text-xs"
              />
            </div>
          ))}
        </div>
      )}

      {scheduleMode === 'now' && (
        <p className="text-sm text-muted-foreground">{t('bulk.publishImmediately')}</p>
      )}
    </div>
  );
}

function toLocalDatetime(iso: string): string {
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}
