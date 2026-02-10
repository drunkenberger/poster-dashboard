import { useTranslation } from 'react-i18next';
import { CheckCircle, Clock, Loader2, FileText, XCircle } from 'lucide-react';
import type { PostStatus } from '../../../../shared/types/index.ts';

const STATUS_CONFIG: Record<PostStatus, { icon: typeof CheckCircle; color: string; bg: string }> = {
  draft: { icon: FileText, color: '#737373', bg: '#f5f5f5' },
  scheduled: { icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
  processing: { icon: Loader2, color: '#6366f1', bg: '#e0e7ff' },
  published: { icon: CheckCircle, color: '#22c55e', bg: '#dcfce7' },
  failed: { icon: XCircle, color: '#ef4444', bg: '#fee2e2' },
};

export default function PostStatusBadge({ status }: { status: PostStatus }) {
  const { t } = useTranslation();
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  const Icon = config.icon;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      <Icon size={12} className={status === 'processing' ? 'animate-spin' : ''} />
      {t(`posts.status.${status}`)}
    </span>
  );
}
