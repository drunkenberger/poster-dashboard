import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PenSquare } from 'lucide-react';
import { usePostsStore } from '../stores/postsStore.ts';
import type { PostStatus } from '../../../shared/types/index.ts';
import PostCard from '../components/posts/PostCard.tsx';
import StatusFilter from '../components/posts/StatusFilter.tsx';
import LoadingSkeleton from '../components/ui/LoadingSkeleton.tsx';
import EmptyState from '../components/ui/EmptyState.tsx';
import ErrorMessage from '../components/ui/ErrorMessage.tsx';

export default function Posts() {
  const { t } = useTranslation();
  const { posts, loading, error, total, fetchPosts } = usePostsStore();
  const [statusFilter, setStatusFilter] = useState<PostStatus | null>(null);

  useEffect(() => {
    const filters: Record<string, string> = {};
    if (statusFilter) filters.status = statusFilter;
    fetchPosts(filters);
  }, [fetchPosts, statusFilter]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">{t('posts.title')}</h2>
          <p className="text-sm text-muted-foreground">{total} posts</p>
        </div>
        <Link
          to="/create"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <PenSquare size={16} />
          {t('posts.newPost')}
        </Link>
      </div>

      <div className="mb-6">
        <StatusFilter selected={statusFilter} onChange={setStatusFilter} />
      </div>

      {loading && <LoadingSkeleton count={4} />}

      {error && <ErrorMessage message={error} onRetry={() => fetchPosts()} />}

      {!loading && !error && posts.length === 0 && (
        <EmptyState title={t('posts.noPosts')} description={t('posts.noPostsDesc')} />
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="grid gap-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
