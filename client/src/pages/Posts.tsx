import { useEffect, useRef, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PenSquare, Loader2 } from 'lucide-react';
import { usePostsStore } from '../stores/postsStore.ts';
import PostCard from '../components/posts/PostCard.tsx';
import StatusFilter from '../components/posts/StatusFilter.tsx';
import LoadingSkeleton from '../components/ui/LoadingSkeleton.tsx';
import EmptyState from '../components/ui/EmptyState.tsx';
import ErrorMessage from '../components/ui/ErrorMessage.tsx';

export default function Posts() {
  const { t } = useTranslation();
  const { posts, loading, loadingMore, error, total, hasMore, fetchPosts, fetchMore } = usePostsStore();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPosts(statusFilter);
  }, [fetchPosts, statusFilter]);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) fetchMore();
    },
    [hasMore, loadingMore, fetchMore],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleIntersect, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersect]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">{t('posts.title')}</h2>
          <p className="text-sm text-muted-foreground">{posts.length}/{total} posts</p>
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
      {error && <ErrorMessage message={error} onRetry={() => fetchPosts(statusFilter)} />}

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

      <div ref={sentinelRef} className="h-1" />
      {loadingMore && (
        <div className="flex justify-center py-4">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
