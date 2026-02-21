import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarClock, ArrowLeft, Play } from 'lucide-react';
import { useDriveStore } from '../stores/driveStore.ts';
import { useCustomFoldersStore } from '../stores/customFoldersStore.ts';
import { useAccountsStore } from '../stores/accountsStore.ts';
import CategoryGrid from '../components/drive/CategoryGrid.tsx';
import AddFolderInput from '../components/drive/AddFolderInput.tsx';
import AccountSelector from '../components/accounts/AccountSelector.tsx';
import AutoScheduleProgress from '../components/auto-schedule/AutoScheduleProgress.tsx';
import LoadingSkeleton from '../components/ui/LoadingSkeleton.tsx';
import { runAutoSchedule, type ScheduleProgress } from '../utils/autoScheduleRunner.ts';

type Phase = 'config' | 'running' | 'done';

function defaultStartTime(): string {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

export default function AutoSchedule() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { categories, videos, selectedCategory, loadingCategories, loadingVideos, fetchCategories, selectCategory, clearSelection } = useDriveStore();
  const { folders: customFolders, removeFolder } = useCustomFoldersStore();
  const { accounts, fetchAccounts } = useAccountsStore();

  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [minInterval, setMinInterval] = useState(60);
  const [maxInterval, setMaxInterval] = useState(180);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [phase, setPhase] = useState<Phase>('config');
  const [progress, setProgress] = useState<ScheduleProgress | null>(null);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { if (accounts.length === 0) fetchAccounts(); }, [accounts.length, fetchAccounts]);
  useEffect(() => {
    if (accounts.length > 0 && selectedAccounts.length === 0) {
      setSelectedAccounts(accounts.map((a) => a.id));
    }
  }, [accounts, selectedAccounts.length]);

  const allCategories = useMemo(() => {
    const apiIds = new Set(categories.map((c) => c.id));
    const extras = customFolders.filter((f) => !apiIds.has(f.id));
    return [...categories, ...extras];
  }, [categories, customFolders]);

  const customFolderIds = useMemo(() => new Set(customFolders.map((f) => f.id)), [customFolders]);

  const selectedAccountObjects = useMemo(
    () => accounts.filter((a) => selectedAccounts.includes(a.id)),
    [accounts, selectedAccounts],
  );

  const totalPosts = videos.length * selectedAccounts.length;
  const canStart = selectedCategory && videos.length > 0 && selectedAccounts.length > 0 && minInterval <= maxInterval && startTime;

  const handleStart = useCallback(async () => {
    if (!canStart) return;
    setPhase('running');
    setProgress(null);

    const result = await runAutoSchedule(
      { videos, accounts: selectedAccountObjects, minInterval, maxInterval, startTime: new Date(startTime).toISOString() },
      (p) => setProgress({ ...p }),
    );

    setProgress(result);
    setPhase('done');
  }, [canStart, videos, selectedAccountObjects, minInterval, maxInterval, startTime]);

  const reset = () => {
    setPhase('config');
    setProgress(null);
    clearSelection();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        {selectedCategory && phase === 'config' && (
          <button onClick={clearSelection} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">
            <ArrowLeft size={20} />
          </button>
        )}
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CalendarClock size={24} /> {t('autoSchedule.title')}
        </h2>
      </div>

      {phase === 'config' && (
        <>
          {!selectedCategory ? (
            <section id="auto-schedule-folder-053" className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{t('autoSchedule.selectFolder')}</h3>
                <AddFolderInput />
              </div>
              {loadingCategories ? <LoadingSkeleton count={4} /> : (
                <CategoryGrid categories={allCategories} onSelect={selectCategory} customFolderIds={customFolderIds} onRemoveCustom={removeFolder} />
              )}
            </section>
          ) : (
            <>
              <div className="p-3 rounded-lg border border-border bg-card">
                <span className="text-sm">
                  {loadingVideos
                    ? t('common.loading')
                    : t('autoSchedule.videosInFolder', { folder: selectedCategory.name, count: videos.length })}
                </span>
              </div>

              <section id="auto-schedule-accounts-054">
                <AccountSelector selected={selectedAccounts} onChange={setSelectedAccounts} />
              </section>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('autoSchedule.startTime')}</label>
                  <input
                    id="auto-schedule-start-time-055"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('autoSchedule.minInterval')}</label>
                  <input
                    id="auto-schedule-min-interval-056"
                    type="number"
                    min={1}
                    value={minInterval}
                    onChange={(e) => setMinInterval(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('autoSchedule.maxInterval')}</label>
                  <input
                    id="auto-schedule-max-interval-057"
                    type="number"
                    min={1}
                    value={maxInterval}
                    onChange={(e) => setMaxInterval(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                id="auto-schedule-start-btn-058"
                onClick={handleStart}
                disabled={!canStart || loadingVideos}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                <Play size={16} />
                {t('autoSchedule.startBtn', { count: totalPosts })}
              </button>
            </>
          )}
        </>
      )}

      {(phase === 'running' || phase === 'done') && progress && (
        <>
          <AutoScheduleProgress progress={progress} />
          {phase === 'done' && (
            <div className="flex gap-3">
              <button
                id="auto-schedule-view-posts-060"
                onClick={() => navigate('/posts')}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90"
              >
                {t('autoSchedule.viewPosts')}
              </button>
              <button
                onClick={reset}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-md border border-border hover:bg-muted"
              >
                {t('autoSchedule.scheduleMore')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
