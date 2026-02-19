import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import type { SocialAccount } from '../../../../shared/types/index.ts';
import PlatformIcon from '../ui/PlatformIcon.tsx';

interface AccountsSummaryProps {
  accounts: SocialAccount[];
  loading: boolean;
}

export default function AccountsSummary({ accounts, loading }: AccountsSummaryProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">{t('dashboard.activeAccounts')}</h3>
        <Link
          to="/accounts"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          {t('nav.accounts')}
          <ArrowRight size={14} />
        </Link>
      </div>

      {loading && (
        <div className="p-5 space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!loading && accounts.length === 0 && (
        <div className="p-8 text-center text-sm text-muted-foreground">
          {t('accounts.noAccounts')}
        </div>
      )}

      {!loading && accounts.length > 0 && (
        <div className="divide-y divide-border">
          {accounts.map((acc) => (
            <div key={acc.id} className="flex items-center gap-3 px-5 py-3">
              <PlatformIcon platform={acc.platform} size={18} />
              <span className="text-sm text-foreground">@{acc.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
