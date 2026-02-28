import { useTranslation } from 'react-i18next';
import { FileText, CheckCircle2, CalendarClock, AlertCircle, Loader2 } from 'lucide-react';
import type { SocialAccount, Post } from '../../../../shared/types/index.ts';
import PlatformIcon from '../ui/PlatformIcon.tsx';

interface AccountStats {
  total: number;
  published: number;
  scheduled: number;
  failed: number;
  processing: number;
}

interface Props {
  accounts: SocialAccount[];
  posts: Post[];
  loading: boolean;
}

function buildStatsMap(posts: Post[]): Record<number, AccountStats> {
  const map: Record<number, AccountStats> = {};
  for (const post of posts) {
    for (const accountId of post.social_accounts) {
      if (!map[accountId]) {
        map[accountId] = { total: 0, published: 0, scheduled: 0, failed: 0, processing: 0 };
      }
      map[accountId].total++;
      if (post.status === 'published') map[accountId].published++;
      else if (post.status === 'scheduled') map[accountId].scheduled++;
      else if (post.status === 'failed') map[accountId].failed++;
      else if (post.status === 'processing') map[accountId].processing++;
    }
  }
  return map;
}

function GlobalStats({ posts }: { posts: Post[] }) {
  const { t } = useTranslation();
  const total = posts.length;
  const published = posts.filter((p) => p.status === 'published').length;
  const scheduled = posts.filter((p) => p.status === 'scheduled').length;
  const failed = posts.filter((p) => p.status === 'failed').length;

  const items = [
    { label: t('analytics.totalPosts'), value: total, icon: FileText, color: 'text-primary' },
    { label: t('posts.status.published'), value: published, icon: CheckCircle2, color: 'text-green-500' },
    { label: t('posts.status.scheduled'), value: scheduled, icon: CalendarClock, color: 'text-blue-500' },
    { label: t('posts.status.failed'), value: failed, icon: AlertCircle, color: 'text-red-500' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
          <Icon size={22} className={color} />
          <div>
            <p className="text-xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsOverview({ accounts, posts, loading }: Props) {
  const { t } = useTranslation();

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={28} /></div>;
  }

  const statsMap = buildStatsMap(posts);

  return (
    <div className="space-y-6">
      <GlobalStats posts={posts} />

      <h3 className="text-lg font-semibold">{t('analytics.accountsTitle')}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {accounts.map((account) => {
          const s = statsMap[account.id] ?? { total: 0, published: 0, scheduled: 0, failed: 0, processing: 0 };
          return (
            <div
              key={account.id}
              className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted shrink-0">
                <PlatformIcon platform={account.platform} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">@{account.username}</p>
                <p className="text-xs text-muted-foreground capitalize">{account.platform}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                  <span className="inline-flex items-center gap-1 text-foreground">
                    <FileText size={12} /> {s.total} {t('analytics.totalPosts')}
                  </span>
                  {s.published > 0 && (
                    <span className="inline-flex items-center gap-1 text-green-500">
                      <CheckCircle2 size={12} /> {s.published}
                    </span>
                  )}
                  {s.scheduled > 0 && (
                    <span className="inline-flex items-center gap-1 text-blue-500">
                      <CalendarClock size={12} /> {s.scheduled}
                    </span>
                  )}
                  {s.processing > 0 && (
                    <span className="inline-flex items-center gap-1 text-indigo-500">
                      <Loader2 size={12} /> {s.processing}
                    </span>
                  )}
                  {s.failed > 0 && (
                    <span className="inline-flex items-center gap-1 text-red-500">
                      <AlertCircle size={12} /> {s.failed}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
