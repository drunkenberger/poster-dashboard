import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, RefreshCw, Tags } from 'lucide-react';
import { useAccountsStore } from '../stores/accountsStore.ts';
import type { Platform, Post } from '../../../shared/types/index.ts';
import { postsService } from '../services/posts.ts';
import type { AccountStats } from '../components/accounts/AccountPostStats.tsx';
import AccountCard from '../components/accounts/AccountCard.tsx';
import PlatformFilter from '../components/accounts/PlatformFilter.tsx';
import CategoryFilter from '../components/categories/CategoryFilter.tsx';
import CategoryManager from '../components/categories/CategoryManager.tsx';
import LoadingSkeleton from '../components/ui/LoadingSkeleton.tsx';
import EmptyState from '../components/ui/EmptyState.tsx';
import ErrorMessage from '../components/ui/ErrorMessage.tsx';

const POSTBRIDGE_DASHBOARD = 'https://post-bridge.com/dashboard';

function buildStatsMap(posts: Post[]): Record<number, AccountStats> {
  const map: Record<number, AccountStats> = {};
  for (const post of posts) {
    for (const accountId of post.social_accounts) {
      if (!map[accountId]) {
        map[accountId] = { total: 0, published: 0, scheduled: 0, failed: 0 };
      }
      map[accountId].total++;
      if (post.status === 'published') map[accountId].published++;
      else if (post.status === 'scheduled') map[accountId].scheduled++;
      else if (post.status === 'failed') map[accountId].failed++;
    }
  }
  return map;
}

export default function Accounts() {
  const { t } = useTranslation();
  const {
    accounts, loading, error, platformFilter, categoryFilter,
    fetchAccounts, setPlatformFilter, setCategoryFilter, filteredAccounts,
  } = useAccountsStore();

  const [managerOpen, setManagerOpen] = useState(false);
  const [statsMap, setStatsMap] = useState<Record<number, AccountStats>>({});

  useEffect(() => {
    fetchAccounts();
    postsService.getAllUnpaginated().then((posts) => {
      setStatsMap(buildStatsMap(posts));
    }).catch(() => {});
  }, [fetchAccounts]);

  const availablePlatforms = useMemo(() => {
    const set = new Set(accounts.map((a) => a.platform));
    return [...set] as Platform[];
  }, [accounts]);

  const displayed = filteredAccounts();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">{t('accounts.title')}</h2>
        <div className="flex items-center gap-2">
          <button
            id="accounts-manage-cats-028"
            onClick={() => setManagerOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
          >
            <Tags size={14} />
            {t('categories.manage')}
          </button>
          <button
            id="accounts-refresh-btn-010"
            onClick={fetchAccounts}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {t('accounts.refresh')}
          </button>
          <a
            id="accounts-connect-btn-011"
            href={POSTBRIDGE_DASHBOARD}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <ExternalLink size={14} />
            {t('accounts.connect')}
          </a>
        </div>
      </div>

      {accounts.length > 0 && (
        <div className="mb-6 space-y-3">
          <PlatformFilter
            selected={platformFilter}
            onChange={setPlatformFilter}
            availablePlatforms={availablePlatforms}
          />
          <CategoryFilter selected={categoryFilter} onChange={setCategoryFilter} />
        </div>
      )}

      {loading && <LoadingSkeleton count={3} />}

      {error && <ErrorMessage message={error} onRetry={fetchAccounts} />}

      {!loading && !error && displayed.length === 0 && (
        <EmptyState title={t('accounts.noAccounts')} description={t('accounts.connectInfo')} />
      )}

      {!loading && !error && displayed.length > 0 && (
        <div className="grid gap-3">
          {displayed.map((account) => (
            <AccountCard key={account.id} account={account} stats={statsMap[account.id]} />
          ))}
        </div>
      )}

      <CategoryManager open={managerOpen} onClose={() => setManagerOpen(false)} />
    </div>
  );
}
