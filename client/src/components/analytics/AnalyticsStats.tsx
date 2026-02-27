import { useTranslation } from 'react-i18next';
import { Eye, Heart, MessageCircle, Share2 } from 'lucide-react';
import type { AnalyticsRecord } from '../../services/analytics.ts';

interface Props {
  records: AnalyticsRecord[];
}

function sum(records: AnalyticsRecord[], key: keyof AnalyticsRecord): number {
  return records.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

const STATS = [
  { key: 'view_count' as const, icon: Eye, color: 'text-blue-500', labelKey: 'analytics.views' },
  { key: 'like_count' as const, icon: Heart, color: 'text-red-500', labelKey: 'analytics.likes' },
  { key: 'comment_count' as const, icon: MessageCircle, color: 'text-amber-500', labelKey: 'analytics.comments' },
  { key: 'share_count' as const, icon: Share2, color: 'text-green-500', labelKey: 'analytics.shares' },
];

export default function AnalyticsStats({ records }: Props) {
  const { t } = useTranslation();

  return (
    <div id="analytics-stats-090" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {STATS.map(({ key, icon: Icon, color, labelKey }) => (
        <div key={key} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
          <Icon size={22} className={color} />
          <div>
            <p className="text-xl font-bold">{formatCount(sum(records, key))}</p>
            <p className="text-xs text-muted-foreground">{t(labelKey)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
