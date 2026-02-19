import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';

interface BulkStepsProps {
  current: number;
  total: number;
}

const STEP_KEYS = ['bulk.stepVideos', 'bulk.stepConfig', 'bulk.stepSchedule', 'bulk.stepReview'];

export default function BulkSteps({ current, total }: BulkStepsProps) {
  const { t } = useTranslation();

  return (
    <div id="bulk-steps-029" className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 ${
                done ? 'bg-primary text-primary-foreground' :
                active ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' :
                'bg-muted text-muted-foreground'
              }`}
            >
              {done ? <Check size={14} /> : i + 1}
            </div>
            <span className={`text-xs hidden sm:block truncate ${active ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
              {t(STEP_KEYS[i])}
            </span>
            {i < total - 1 && <div className="flex-1 h-px bg-border" />}
          </div>
        );
      })}
    </div>
  );
}
