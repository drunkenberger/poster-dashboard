import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { SocialAccount, Post } from '../../../../shared/types/index.ts';
import PostStatusBadge from '../posts/PostStatusBadge.tsx';
import PlatformIcon from '../ui/PlatformIcon.tsx';

interface Props {
  accounts: SocialAccount[];
  posts: Post[];
  loading: boolean;
}

const PAGE_SIZE = 20;

export default function AllPostsTable({ accounts, posts, loading }: Props) {
  const { t } = useTranslation();
  const [accountFilter, setAccountFilter] = useState<number | null>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!accountFilter) return posts;
    return posts.filter((p) => p.social_accounts.includes(accountFilter));
  }, [posts, accountFilter]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleAccountChange = (id: number | null) => {
    setAccountFilter(id);
    setPage(0);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={28} /></div>;
  }

  return (
    <div className="space-y-4">
      <div id="analytics-account-filter-094" className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => handleAccountChange(null)}
          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
            !accountFilter ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'
          }`}
        >
          {t('common.all')}
        </button>
        {accounts.map((a) => (
          <button
            key={a.id}
            onClick={() => handleAccountChange(a.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-colors ${
              accountFilter === a.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'
            }`}
          >
            <PlatformIcon platform={a.platform} size={14} />
            @{a.username}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} {t('analytics.totalPosts')}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {t('posts.noPosts')}
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table id="analytics-posts-table-095" className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">
                    {t('posts.caption')}
                  </th>
                  <th className="text-center px-2 py-2.5 text-xs font-medium text-muted-foreground hidden sm:table-cell">
                    {t('posts.accounts', { defaultValue: 'Accounts' })}
                  </th>
                  <th className="text-center px-2 py-2.5 text-xs font-medium text-muted-foreground">
                    {t('bulk.status')}
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground hidden sm:table-cell">
                    {t('analytics.date')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paged.map((post) => {
                  const dateStr = post.scheduled_at ?? post.created_at;
                  const formattedDate = dateStr
                    ? format(new Date(dateStr), 'dd MMM yyyy, HH:mm', { locale: es })
                    : '—';
                  const caption = post.caption.length > 80
                    ? post.caption.slice(0, 80) + '...'
                    : post.caption;

                  return (
                    <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2.5">
                        <Link to={`/posts/${post.id}`} className="hover:text-primary transition-colors">
                          <span className="text-xs line-clamp-2">{caption || post.id.slice(0, 8)}</span>
                        </Link>
                      </td>
                      <td className="text-center px-2 py-2.5 hidden sm:table-cell">
                        <div className="flex justify-center gap-0.5">
                          {post.social_accounts.map((aid) => {
                            const acc = accounts.find((a) => a.id === aid);
                            return acc ? (
                              <PlatformIcon key={aid} platform={acc.platform} size={14} />
                            ) : null;
                          })}
                        </div>
                      </td>
                      <td className="text-center px-2 py-2.5">
                        <PostStatusBadge status={post.status} />
                      </td>
                      <td className="text-left px-3 py-2.5 text-xs text-muted-foreground hidden sm:table-cell">
                        {formattedDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page + 1 >= totalPages}
            className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
