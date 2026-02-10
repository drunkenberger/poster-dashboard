import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccountsStore } from '../stores/accountsStore.ts';
import type { Platform } from '../../../shared/types/index.ts';
import AccountCard from '../components/accounts/AccountCard.tsx';
import PlatformFilter from '../components/accounts/PlatformFilter.tsx';
import LoadingSkeleton from '../components/ui/LoadingSkeleton.tsx';
import EmptyState from '../components/ui/EmptyState.tsx';
import ErrorMessage from '../components/ui/ErrorMessage.tsx';

export default function Accounts() {
  const { t } = useTranslation();
  const { accounts, loading, error, platformFilter, fetchAccounts, setPlatformFilter, filteredAccounts } =
    useAccountsStore();

  useEffect(() => {
    fetchAccounts();
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
        <span className="text-sm text-muted-foreground">
          {accounts.length} {t('accounts.title').toLowerCase()}
        </span>
      </div>

      {accounts.length > 0 && (
        <div className="mb-6">
          <PlatformFilter
            selected={platformFilter}
            onChange={setPlatformFilter}
            availablePlatforms={availablePlatforms}
          />
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
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </div>
  );
}
