import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, Image, Users, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { postsService } from '../services/posts.ts';
import { resultsService } from '../services/results.ts';
import type { Post, PostResult } from '../../../shared/types/index.ts';
import PostStatusBadge from '../components/posts/PostStatusBadge.tsx';
import PostResultCard from '../components/posts/PostResultCard.tsx';
import LoadingSkeleton from '../components/ui/LoadingSkeleton.tsx';
import ErrorMessage from '../components/ui/ErrorMessage.tsx';
import { toast } from '../components/ui/Toast.tsx';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [post, setPost] = useState<Post | null>(null);
  const [results, setResults] = useState<PostResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [postData, resultsData] = await Promise.all([
        postsService.getById(id),
        resultsService.getAll({ post_id: id }).catch(() => ({ data: [], meta: { total: 0, offset: 0, limit: 25, next: null } })),
      ]);
      setPost(postData);
      setResults(resultsData.data);
    } catch {
      setError(t('posts.detailError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleDelete = async () => {
    if (!id || !post) return;
    try {
      await postsService.delete(id);
      toast(t('posts.deleteSuccess'), 'success');
      window.history.back();
    } catch {
      toast(t('posts.deleteError'), 'error');
    }
  };

  if (loading) return <LoadingSkeleton count={3} />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;
  if (!post) return null;

  const dateStr = post.scheduled_at ?? post.created_at;
  const formattedDate = dateStr ? format(new Date(dateStr), "dd MMM yyyy, HH:mm", { locale: es }) : '';

  return (
    <div id="post-detail-021" className="max-w-3xl mx-auto">
      <Link
        to="/posts"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft size={16} />
        {t('posts.title')}
      </Link>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <PostStatusBadge status={post.status} />
          {(post.status === 'draft' || post.status === 'scheduled') && (
            <button
              id="post-delete-btn-022"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 text-sm text-destructive hover:underline"
            >
              <Trash2 size={14} />
              {t('common.delete')}
            </button>
          )}
        </div>

        <div className="p-5 space-y-4">
          <p className="text-foreground whitespace-pre-wrap">{post.caption}</p>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} />
              {formattedDate}
            </span>
            {(post.media?.length ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Image size={14} />
                {post.media.length} media
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Users size={14} />
              {post.social_accounts?.length ?? 0} {t('posts.accounts')}
            </span>
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-semibold">{t('results.title')}</h3>
          {results.map((result) => (
            <PostResultCard key={result.id} result={result} />
          ))}
        </div>
      )}

      {!loading && results.length === 0 && post.status !== 'draft' && post.status !== 'scheduled' && (
        <div className="mt-6 p-6 text-center text-sm text-muted-foreground rounded-xl border border-border bg-card">
          {t('results.noResults')}
        </div>
      )}
    </div>
  );
}
