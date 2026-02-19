import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import BulkSteps from '../components/bulk/BulkSteps.tsx';
import BulkVideoSelect from '../components/bulk/BulkVideoSelect.tsx';
import BulkPostConfig from '../components/bulk/BulkPostConfig.tsx';
import BulkScheduler from '../components/bulk/BulkScheduler.tsx';
import BulkReview from '../components/bulk/BulkReview.tsx';
import type { BulkPostItem, PlatformConfigurations } from '../../../shared/types/index.ts';
import { loadClipsForBulk, clearClipsForBulk } from '../utils/shortsStorage.ts';

type AccountMode = 'shared' | 'individual';
type ScheduleMode = 'now' | 'interval' | 'manual';

export default function BulkCreate() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [items, setItems] = useState<BulkPostItem[]>([]);
  const [accountMode, setAccountMode] = useState<AccountMode>('shared');
  const [sharedAccounts, setSharedAccounts] = useState<number[]>([]);
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('now');
  const [startTime, setStartTime] = useState('');
  const [interval, setInterval] = useState(2);
  const [platformConfig, setPlatformConfig] = useState<PlatformConfigurations>({ instagram: { placement: 'reels' } });

  useEffect(() => {
    const saved = loadClipsForBulk();
    if (saved && saved.length > 0) {
      setItems(saved);
      clearClipsForBulk();
    }
  }, []);

  const canNext = step === 0
    ? items.length > 0
    : step === 1
      ? accountMode === 'individual' || sharedAccounts.length > 0
      : true;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{t('bulk.title')}</h2>
      <BulkSteps current={step} total={4} />

      {step === 0 && <BulkVideoSelect items={items} onItemsChange={setItems} />}
      {step === 1 && (
        <BulkPostConfig
          items={items} onItemsChange={setItems}
          accountMode={accountMode} onAccountModeChange={setAccountMode}
          sharedAccounts={sharedAccounts} onSharedAccountsChange={setSharedAccounts}
          platformConfig={platformConfig} onPlatformConfigChange={setPlatformConfig}
        />
      )}
      {step === 2 && (
        <BulkScheduler
          items={items} onItemsChange={setItems}
          scheduleMode={scheduleMode} onScheduleModeChange={setScheduleMode}
          startTime={startTime} onStartTimeChange={setStartTime}
          interval={interval} onIntervalChange={setInterval}
        />
      )}
      {step === 3 && (
        <BulkReview
          items={items} sharedAccounts={sharedAccounts}
          accountMode={accountMode} platformConfig={platformConfig}
        />
      )}

      {step < 3 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-1 px-4 py-2 text-sm rounded-md border border-border hover:bg-muted disabled:opacity-30"
          >
            <ArrowLeft size={16} /> {t('bulk.prev')}
          </button>
          <span className="text-xs text-muted-foreground">
            {items.length} {t('bulk.videosSelected')}
          </span>
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext}
            className="flex items-center gap-1 px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {t('bulk.next')} <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
