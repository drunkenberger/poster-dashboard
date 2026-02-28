import { useTranslation } from 'react-i18next';
import { FileText, CheckCircle2, CalendarClock, AlertCircle } from 'lucide-react';

export interface AccountStats {
  total: number;
  published: number;
  scheduled: number;
  failed: number;
}

interface AccountPostStatsProps {
  stats: AccountStats;
}

export default function AccountPostStats({ stats }: AccountPostStatsProps) {
  const { t } = useTranslation();

  if (stats.total === 0) {
    return (
      <p id="account-stats-no-posts" className="text-xs text-muted-foreground">
        {t('accounts.noPosts')}
      </p>
    );
  }

  const items = [
    { label: t('accounts.totalPosts'), value: stats.total, icon: FileText, color: 'text-foreground' },
    { label: t('posts.status.published'), value: stats.published, icon: CheckCircle2, color: 'text-green-500' },
    { label: t('posts.status.scheduled'), value: stats.scheduled, icon: CalendarClock, color: 'text-blue-500' },
    { label: t('posts.status.failed'), value: stats.failed, icon: AlertCircle, color: 'text-red-500' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      {items.map(({ label, value, icon: Icon, color }) =>
        value > 0 && (
          <span key={label} className={`inline-flex items-center gap-1 ${color}`}>
            <Icon size={12} />
            {value} {label}
          </span>
        ),
      )}
    </div>
  );
}
