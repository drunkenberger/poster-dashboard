import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarClock, ArrowLeft, Play } from 'lucide-react';
import { useDriveStore } from '../stores/driveStore.ts';
import { useCustomFoldersStore } from '../stores/customFoldersStore.ts';
import { useAccountsStore } from '../stores/accountsStore.ts';
import { driveService } from '../services/drive.ts';
import type { DriveCategory } from '../../../shared/types/index.ts';
import type { CarouselFolder } from '../utils/carouselScheduleRunner.ts';
import CategoryGrid from '../components/drive/CategoryGrid.tsx';
import AddFolderInput from '../components/drive/AddFolderInput.tsx';
import AccountSelector from '../components/accounts/AccountSelector.tsx';
import AutoScheduleProgress from '../components/auto-schedule/AutoScheduleProgress.tsx';
import LoadingSkeleton from '../components/ui/LoadingSkeleton.tsx';
import { runAutoSchedule, type ScheduleProgress } from '../utils/autoScheduleRunner.ts';
import { runCarouselSchedule } from '../utils/carouselScheduleRunner.ts';

type Phase = 'config' | 'running' | 'done';
type ContentMode = 'videos' | 'carousels';

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

  const [mode, setMode] = useState<ContentMode>('videos');
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [minInterval, setMinInterval] = useState(60);
  const [maxInterval, setMaxInterval] = useState(180);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [phase, setPhase] = useState<Phase>('config');
  const [progress, setProgress] = useState<ScheduleProgress | null>(null);
  const [carouselFolders, setCarouselFolders] = useState<CarouselFolder[]>([]);
  const [selectedCarouselIds, setSelectedCarouselIds] = useState<Set<string>>(new Set());
  const [loadingCarousels, setLoadingCarousels] = useState(false);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { if (accounts.length === 0) fetchAccounts(); }, [accounts.length, fetchAccounts]);
  useEffect(() => {
    if (accounts.length > 0 && selectedAccounts.length === 0)
      setSelectedAccounts(accounts.map((a) => a.id));
  }, [accounts, selectedAccounts.length]);

  const allCategories = useMemo(() => {
    const apiIds = new Set(categories.map((c) => c.id));
    return [...categories, ...customFolders.filter((f) => !apiIds.has(f.id))];
  }, [categories, customFolders]);

  const customFolderIds = useMemo(() => new Set(customFolders.map((f) => f.id)), [customFolders]);
  const selectedAccountObjects = useMemo(() => accounts.filter((a) => selectedAccounts.includes(a.id)), [accounts, selectedAccounts]);
  const selectedCarousels = useMemo(() => carouselFolders.filter((f) => selectedCarouselIds.has(f.id)), [carouselFolders, selectedCarouselIds]);

  const handleSelectFolder = useCallback(async (folder: DriveCategory) => {
    selectCategory(folder);
    if (mode === 'carousels') {
      setLoadingCarousels(true);
      try {
        const found = await driveService.findCarouselFolders(folder.id);
        setCarouselFolders(found);
        setSelectedCarouselIds(new Set(found.map((f) => f.id)));
      } catch { setCarouselFolders([]); setSelectedCarouselIds(new Set()); }
      finally { setLoadingCarousels(false); }
    }
  }, [mode, selectCategory]);

  const handleModeChange = (m: ContentMode) => {
    setMode(m);
    clearSelection();
    setCarouselFolders([]);
    setSelectedCarouselIds(new Set());
  };

  const toggleCarousel = (id: string) => {
    setSelectedCarouselIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAllCarousels = () => {
    if (selectedCarouselIds.size === carouselFolders.length) {
      setSelectedCarouselIds(new Set());
    } else {
      setSelectedCarouselIds(new Set(carouselFolders.map((f) => f.id)));
    }
  };

  const itemCount = mode === 'videos' ? videos.length : selectedCarousels.length;
  const isLoading = mode === 'videos' ? loadingVideos : loadingCarousels;
  const totalPosts = itemCount * selectedAccounts.length;
  const canStart = selectedCategory && itemCount > 0 && selectedAccounts.length > 0 && minInterval <= maxInterval && startTime;

  const handleStart = useCallback(async () => {
    if (!canStart) return;
    setPhase('running');
    setProgress(null);

    const baseConfig = { accounts: selectedAccountObjects, minInterval, maxInterval, startTime: new Date(startTime).toISOString() };
    const result = mode === 'videos'
      ? await runAutoSchedule({ videos, ...baseConfig }, (p) => setProgress({ ...p }))
      : await runCarouselSchedule({ carouselFolders: selectedCarousels, ...baseConfig }, (p) => setProgress({ ...p }));

    setProgress(result);
    setPhase('done');
  }, [canStart, videos, selectedCarousels, selectedAccountObjects, minInterval, maxInterval, startTime, mode]);

  const reset = () => { setPhase('config'); setProgress(null); clearSelection(); setCarouselFolders([]); setSelectedCarouselIds(new Set()); };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        {selectedCategory && phase === 'config' && (
          <button onClick={() => { clearSelection(); setCarouselFolders([]); setSelectedCarouselIds(new Set()); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">
            <ArrowLeft size={20} />
          </button>
        )}
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CalendarClock size={24} /> {t('autoSchedule.title')}
        </h2>
      </div>

      {phase === 'config' && (
        <>
          <ModeToggle mode={mode} onChange={handleModeChange} />

          {!selectedCategory ? (
            <section id="auto-schedule-folder-053" className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{t('autoSchedule.selectFolder')}</h3>
                <AddFolderInput />
              </div>
              {loadingCategories ? <LoadingSkeleton count={4} /> : (
                <CategoryGrid categories={allCategories} onSelect={handleSelectFolder} customFolderIds={customFolderIds} onRemoveCustom={removeFolder} />
              )}
            </section>
          ) : (
            <>
              {mode === 'carousels' ? (
                <CarouselList
                  folders={carouselFolders}
                  selectedIds={selectedCarouselIds}
                  loading={loadingCarousels}
                  onToggle={toggleCarousel}
                  onToggleAll={toggleAllCarousels}
                />
              ) : (
                <div className="p-3 rounded-lg border border-border bg-card">
                  <span className="text-sm">
                    {loadingVideos ? t('common.loading') : t('autoSchedule.videosInFolder', { folder: selectedCategory.name, count: videos.length })}
                  </span>
                </div>
              )}

              <section id="auto-schedule-accounts-054">
                <AccountSelector selected={selectedAccounts} onChange={setSelectedAccounts} />
              </section>

              <ScheduleConfig
                startTime={startTime} minInterval={minInterval} maxInterval={maxInterval}
                onStartTime={setStartTime} onMinInterval={setMinInterval} onMaxInterval={setMaxInterval}
              />

              <button
                id="auto-schedule-start-btn-058"
                onClick={handleStart}
                disabled={!canStart || isLoading}
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
          <AutoScheduleProgress progress={progress} carouselMode={mode === 'carousels'} />
          {phase === 'done' && (
            <div className="flex gap-3">
              <button id="auto-schedule-view-posts-060" onClick={() => navigate('/posts')} className="flex-1 px-4 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90">
                {t('autoSchedule.viewPosts')}
              </button>
              <button onClick={reset} className="flex-1 px-4 py-2.5 text-sm font-medium rounded-md border border-border hover:bg-muted">
                {t('autoSchedule.scheduleMore')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CarouselList({ folders, selectedIds, loading, onToggle, onToggleAll }: {
  folders: CarouselFolder[]; selectedIds: Set<string>; loading: boolean;
  onToggle: (id: string) => void; onToggleAll: () => void;
}) {
  const { t } = useTranslation();
  if (loading) return <LoadingSkeleton count={3} />;

  const allSelected = folders.length > 0 && selectedIds.size === folders.length;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
          <input type="checkbox" checked={allSelected} onChange={onToggleAll} className="rounded" />
          {t('autoSchedule.carouselsFound', { count: folders.length })}
        </label>
        <span className="text-xs text-muted-foreground">
          {selectedIds.size} {t('autoSchedule.selected')}
        </span>
      </div>
      <ul className="max-h-52 overflow-y-auto divide-y divide-border">
        {folders.map((f) => (
          <li key={f.id}>
            <label className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/30 transition-colors">
              <input
                type="checkbox"
                checked={selectedIds.has(f.id)}
                onChange={() => onToggle(f.id)}
                className="rounded flex-shrink-0"
              />
              <span className="text-sm truncate">{f.path}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: ContentMode; onChange: (m: ContentMode) => void }) {
  const { t } = useTranslation();
  return (
    <div id="auto-schedule-mode-085" className="flex rounded-lg overflow-hidden border border-border">
      {(['videos', 'carousels'] as const).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            mode === m ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
          }`}
        >
          {t(`autoSchedule.mode_${m}`)}
        </button>
      ))}
    </div>
  );
}

function ScheduleConfig({ startTime, minInterval, maxInterval, onStartTime, onMinInterval, onMaxInterval }: {
  startTime: string; minInterval: number; maxInterval: number;
  onStartTime: (v: string) => void; onMinInterval: (v: number) => void; onMaxInterval: (v: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">{t('autoSchedule.startTime')}</label>
        <input id="auto-schedule-start-time-055" type="datetime-local" value={startTime} onChange={(e) => onStartTime(e.target.value)} className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{t('autoSchedule.minInterval')}</label>
        <input id="auto-schedule-min-interval-056" type="number" min={1} value={minInterval} onChange={(e) => onMinInterval(Number(e.target.value))} className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{t('autoSchedule.maxInterval')}</label>
        <input id="auto-schedule-max-interval-057" type="number" min={1} value={maxInterval} onChange={(e) => onMaxInterval(Number(e.target.value))} className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>
    </div>
  );
}
