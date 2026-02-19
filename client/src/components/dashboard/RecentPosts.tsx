import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Post } from '../../../../shared/types/index.ts';
import PostStatusBadge from '../posts/PostStatusBadge.tsx';

interface RecentPostsProps {
  posts: Post[];
  loading: boolean;
}

export default function RecentPosts({ posts, loading }: RecentPostsProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">{t('dashboard.recentPosts')}</h3>
        <Link
          to="/posts"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          {t('posts.title')}
          <ArrowRight size={14} />
        </Link>
      </div>

      {loading && (
        <div className="p-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="p-8 text-center text-sm text-muted-foreground">
          {t('posts.noPosts')}
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="divide-y divide-border">
          {posts.slice(0, 5).map((post) => (
            <div key={post.id} className="flex items-center gap-3 px-5 py-3">
              <p className="flex-1 text-sm text-foreground truncate">
                {post.caption.length > 80 ? post.caption.slice(0, 80) + '...' : post.caption}
              </p>
              <PostStatusBadge status={post.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
