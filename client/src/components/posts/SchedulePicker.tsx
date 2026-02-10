import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock } from 'lucide-react';

interface SchedulePickerProps {
  scheduledAt: string | null;
  onChange: (iso: string | null) => void;
}

export default function SchedulePicker({ scheduledAt, onChange }: SchedulePickerProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'now' | 'schedule'>(scheduledAt ? 'schedule' : 'now');

  const handleModeChange = (newMode: 'now' | 'schedule') => {
    setMode(newMode);
    if (newMode === 'now') {
      onChange(null);
    } else {
      const defaultDate = new Date();
      defaultDate.setHours(defaultDate.getHours() + 1, 0, 0, 0);
      onChange(defaultDate.toISOString());
    }
  };

  const handleDateTimeChange = (value: string) => {
    if (!value) return;
    const date = new Date(value);
    onChange(date.toISOString());
  };

  const localValue = scheduledAt ? toLocalDateTimeString(new Date(scheduledAt)) : '';

  return (
    <div id="schedule-picker-012" className="space-y-3">
      <label className="text-sm font-medium text-foreground">{t('posts.whenPublish')}</label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleModeChange('now')}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
            mode === 'now'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          <Clock size={14} />
          {t('posts.publishNow')}
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('schedule')}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
            mode === 'schedule'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          <Calendar size={14} />
          {t('posts.schedule')}
        </button>
      </div>

      {mode === 'schedule' && (
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="datetime-local"
            value={localValue}
            onChange={(e) => handleDateTimeChange(e.target.value)}
            min={toLocalDateTimeString(new Date())}
            className="flex-1 px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <p className="text-xs text-muted-foreground self-center">
            {t('posts.scheduleTimezone')}
          </p>
        </div>
      )}
    </div>
  );
}

function toLocalDateTimeString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}`;
}
