import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, RefreshCw, Loader2 } from 'lucide-react';
import { analyticsService, type AnalyticsRecord, type Timeframe } from '../services/analytics.ts';
import { postsService } from '../services/posts.ts';
import { accountsService } from '../services/accounts.ts';
import type { SocialAccount, Post } from '../../../shared/types/index.ts';
import AnalyticsOverview from '../components/analytics/AnalyticsOverview.tsx';
import AllPostsTable from '../components/analytics/AllPostsTable.tsx';
import AnalyticsStats from '../components/analytics/AnalyticsStats.tsx';
import AnalyticsTable from '../components/analytics/AnalyticsTable.tsx';

type Tab = 'overview' | 'posts' | 'tiktok';
const TIMEFRAMES: Timeframe[] = ['7d', '30d', '90d', 'all'];
const TT_PAGE_SIZE = 20;

export default function Analytics() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('overview');

  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingMain, setLoadingMain] = useState(true);

  const [ttRecords, setTtRecords] = useState<AnalyticsRecord[]>([]);
  const [ttTotal, setTtTotal] = useState(0);
  const [ttOffset, setTtOffset] = useState(0);
  const [ttTimeframe, setTtTimeframe] = useState<Timeframe>('30d');
  const [ttLoading, setTtLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');

  useEffect(() => {
    setLoadingMain(true);
    Promise.all([
      accountsService.getAllUnpaginated(),
      postsService.getAllUnpaginated(),
    ]).then(([accs, ps]) => {
      setAccounts(accs);
      setPosts(ps);
    }).catch(() => {})
      .finally(() => setLoadingMain(false));
  }, []);

  const fetchTikTok = useCallback(async (tf: Timeframe, off: number) => {
    setTtLoading(true);
    try {
      const res = await analyticsService.getAll({ timeframe: tf, limit: TT_PAGE_SIZE, offset: off });
      setTtRecords(res.data);
      setTtTotal(res.meta.total);
    } catch { setTtRecords([]); setTtTotal(0); }
    finally { setTtLoading(false); }
  }, []);

  useEffect(() => {
    if (tab === 'tiktok') fetchTikTok(ttTimeframe, ttOffset);
  }, [tab, ttTimeframe, ttOffset, fetchTikTok]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncError('');
    try {
      await analyticsService.sync();
      await fetchTikTok(ttTimeframe, ttOffset);
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setSyncError(status === 429 ? t('analytics.syncRateLimit') : t('analytics.syncError'));
    }
    finally { setSyncing(false); }
  };

  const ttTotalPages = Math.ceil(ttTotal / TT_PAGE_SIZE);
  const ttCurrentPage = Math.floor(ttOffset / TT_PAGE_SIZE) + 1;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: t('analytics.tabOverview') },
    { key: 'posts', label: t('analytics.tabPosts') },
    { key: 'tiktok', label: t('analytics.tabTikTok') },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 size={24} /> {t('analytics.title')}
      </h2>

      <div id="analytics-tabs-096" className="flex rounded-lg overflow-hidden border border-border w-fit">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === key ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <AnalyticsOverview accounts={accounts} posts={posts} loading={loadingMain} />
      )}

      {tab === 'posts' && (
        <AllPostsTable accounts={accounts} posts={posts} loading={loadingMain} />
      )}

      {tab === 'tiktok' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div id="analytics-timeframe-093" className="flex rounded-lg overflow-hidden border border-border w-fit">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => { setTtTimeframe(tf); setTtOffset(0); }}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    ttTimeframe === tf ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
                  }`}
                >
                  {t(`analytics.tf_${tf}`)}
                </button>
              ))}
            </div>
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

          {ttLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={28} /></div>
          ) : (
            <>
              <AnalyticsStats records={ttRecords} />
              <AnalyticsTable records={ttRecords} />

              {ttTotalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setTtOffset(Math.max(0, ttOffset - TT_PAGE_SIZE))}
                    disabled={ttOffset === 0}
                    className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-30"
                  >
                    ←
                  </button>
                  <span className="text-sm text-muted-foreground">{ttCurrentPage} / {ttTotalPages}</span>
                  <button
                    onClick={() => setTtOffset(ttOffset + TT_PAGE_SIZE)}
                    disabled={ttCurrentPage >= ttTotalPages}
                    className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
