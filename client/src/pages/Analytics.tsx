import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, RefreshCw, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { analyticsService, type AnalyticsRecord, type Timeframe } from '../services/analytics.ts';
import AnalyticsStats from '../components/analytics/AnalyticsStats.tsx';
import AnalyticsTable from '../components/analytics/AnalyticsTable.tsx';

const TIMEFRAMES: Timeframe[] = ['7d', '30d', '90d', 'all'];
const PAGE_SIZE = 20;

export default function Analytics() {
  const { t } = useTranslation();
  const [records, setRecords] = useState<AnalyticsRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');

  const fetchData = useCallback(async (tf: Timeframe, off: number) => {
    setLoading(true);
    try {
      const res = await analyticsService.getAll({ timeframe: tf, limit: PAGE_SIZE, offset: off });
      setRecords(res.data);
      setTotal(res.meta.total);
    } catch { setRecords([]); setTotal(0); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(timeframe, offset); }, [timeframe, offset, fetchData]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncError('');
    try {
      await analyticsService.sync();
      await fetchData(timeframe, offset);
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setSyncError(status === 429 ? t('analytics.syncRateLimit') : t('analytics.syncError'));
    }
    finally { setSyncing(false); }
  };

  const handleTimeframe = (tf: Timeframe) => { setTimeframe(tf); setOffset(0); };
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 size={24} /> {t('analytics.title')}
        </h2>
        <button
          id="analytics-sync-btn-092"
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-border hover:bg-muted disabled:opacity-50"
        >
          {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {t('analytics.sync')}
        </button>
      </div>

      {syncError && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{syncError}</p>
      )}

      <div id="analytics-timeframe-093" className="flex rounded-lg overflow-hidden border border-border w-fit">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => handleTimeframe(tf)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              timeframe === tf ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
            }`}
          >
            {t(`analytics.tf_${tf}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={28} /></div>
      ) : (
        <>
          <AnalyticsStats records={records} />
          <AnalyticsTable records={records} />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                disabled={offset === 0}
                className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setOffset(offset + PAGE_SIZE)}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
