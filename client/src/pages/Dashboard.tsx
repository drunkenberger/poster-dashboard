import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, FileText, Clock, XCircle } from 'lucide-react';
import { useAccountsStore } from '../stores/accountsStore.ts';
import { usePostsStore } from '../stores/postsStore.ts';
import StatCard from '../components/dashboard/StatCard.tsx';
import RecentPosts from '../components/dashboard/RecentPosts.tsx';
import QuickActions from '../components/dashboard/QuickActions.tsx';
import AccountsSummary from '../components/dashboard/AccountsSummary.tsx';

export default function Dashboard() {
  const { t } = useTranslation();
  const { accounts, loading: loadingAccounts, fetchAccounts } = useAccountsStore();
  const { posts, loading: loadingPosts, total, fetchPosts } = usePostsStore();

  useEffect(() => {
    fetchAccounts();
    fetchPosts();
  }, [fetchAccounts, fetchPosts]);

  const scheduled = posts.filter((p) => p.status === 'scheduled').length;
  const failed = posts.filter((p) => p.status === 'failed').length;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('dashboard.title')}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label={t('dashboard.activeAccounts')}
          value={accounts.length}
          icon={Users}
          color="#6366f1"
          bgColor="#e0e7ff"
        />
        <StatCard
          label="Total Posts"
          value={total}
          icon={FileText}
          color="#0ea5e9"
          bgColor="#e0f2fe"
        />
        <StatCard
          label={t('dashboard.scheduled')}
          value={scheduled}
          icon={Clock}
          color="#f59e0b"
          bgColor="#fef3c7"
        />
        <StatCard
          label={t('dashboard.failed')}
          value={failed}
          icon={XCircle}
          color="#ef4444"
          bgColor="#fee2e2"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentPosts posts={posts} loading={loadingPosts} />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <AccountsSummary accounts={accounts} loading={loadingAccounts} />
        </div>
      </div>
    </div>
  );
}
