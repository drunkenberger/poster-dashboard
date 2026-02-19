import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Post } from '../../../../shared/types/index.ts';
import PostStatusBadge from './PostStatusBadge.tsx';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const dateStr = post.scheduled_at ?? post.created_at;
  const formattedDate = dateStr ? format(new Date(dateStr), 'dd MMM yyyy, HH:mm', { locale: es }) : '';
  const truncatedCaption = post.caption.length > 120 ? post.caption.slice(0, 120) + '...' : post.caption;

  return (
    <Link
      to={`/posts/${post.id}`}
      id={`post-card-${post.id}`}
      className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border border-border bg-card hover:shadow-sm hover:border-primary/30 transition-all"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground line-clamp-2">{truncatedCaption}</p>
        <p className="text-xs text-muted-foreground mt-1">{formattedDate}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {(post.media?.length ?? 0) > 0 && (
          <span className="text-xs text-muted-foreground">
            {post.media.length} media
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {post.social_accounts?.length ?? 0} cuentas
        </span>
        <PostStatusBadge status={post.status} />
      </div>
    </Link>
  );
}
