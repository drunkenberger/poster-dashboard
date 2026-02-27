import { useTranslation } from 'react-i18next';
import { ExternalLink, Eye, Heart, MessageCircle, Share2 } from 'lucide-react';
import type { AnalyticsRecord } from '../../services/analytics.ts';

interface Props {
  records: AnalyticsRecord[];
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AnalyticsTable({ records }: Props) {
  const { t } = useTranslation();

  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        {t('analytics.noData')}
      </div>
    );
  }

  return (
    <div id="analytics-table-091" className="border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">{t('analytics.post')}</th>
              <th className="text-center px-2 py-2.5 text-xs font-medium text-muted-foreground"><Eye size={14} className="mx-auto" /></th>
              <th className="text-center px-2 py-2.5 text-xs font-medium text-muted-foreground"><Heart size={14} className="mx-auto" /></th>
              <th className="text-center px-2 py-2.5 text-xs font-medium text-muted-foreground"><MessageCircle size={14} className="mx-auto" /></th>
              <th className="text-center px-2 py-2.5 text-xs font-medium text-muted-foreground"><Share2 size={14} className="mx-auto" /></th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground hidden sm:table-cell">{t('analytics.date')}</th>
              <th className="px-2 py-2.5 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2.5 max-w-[240px]">
                    {r.cover_image_url && (
                      <img src={r.cover_image_url} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                    )}
                    <span className="text-xs truncate">{r.video_description || r.id.slice(0, 8)}</span>
                  </div>
                </td>
                <td className="text-center px-2 py-2.5 font-medium">{formatCount(r.view_count)}</td>
                <td className="text-center px-2 py-2.5 font-medium">{formatCount(r.like_count)}</td>
                <td className="text-center px-2 py-2.5 font-medium">{formatCount(r.comment_count)}</td>
                <td className="text-center px-2 py-2.5 font-medium">{formatCount(r.share_count)}</td>
                <td className="text-left px-3 py-2.5 text-xs text-muted-foreground hidden sm:table-cell">
                  {formatDate(r.platform_created_at)}
                </td>
                <td className="px-2 py-2.5">
                  {r.share_url && (
                    <a href={r.share_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                      <ExternalLink size={14} />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
