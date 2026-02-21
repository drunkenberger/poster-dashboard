import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, Clock, Send, Sparkles } from 'lucide-react';
import { postsService } from '../../services/posts.ts';
import { captionsService } from '../../services/captions.ts';
import type { BulkPostItem, PlatformConfigurations, CreatePostDto, AccountConfiguration } from '../../../../shared/types/index.ts';

type ItemStatus = 'pending' | 'captioning' | 'creating' | 'done' | 'error';

interface BulkReviewProps {
  items: BulkPostItem[];
  sharedAccounts: number[];
  accountMode: 'shared' | 'individual';
  platformConfig: PlatformConfigurations;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function BulkReview({ items, sharedAccounts, accountMode, platformConfig }: BulkReviewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [statuses, setStatuses] = useState<Map<string, ItemStatus>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const successCount = [...statuses.values()].filter((s) => s === 'done').length;
  const errorCount = [...statuses.values()].filter((s) => s === 'error').length;

  const handleSubmit = async () => {
    setSubmitting(true);
    const map = new Map<string, ItemStatus>();
    items.forEach((item) => map.set(item.id, 'pending'));
    setStatuses(new Map(map));

    const totalCaptions = items.reduce((sum, item) => {
      const accounts = accountMode === 'shared' ? sharedAccounts : (item.accounts ?? []);
      return sum + accounts.length;
    }, 0);
    setProgress({ current: 0, total: totalCaptions });
    let captionsDone = 0;

    for (const item of items) {
      const accounts = accountMode === 'shared' ? sharedAccounts : (item.accounts ?? []);
      const existingCaptions: string[] = [];
      const accountConfigs: AccountConfiguration[] = [];

      map.set(item.id, 'captioning');
      setStatuses(new Map(map));

      for (const accountId of accounts) {
        try {
          const caption = await captionsService.generate(item.name, existingCaptions);
          existingCaptions.push(caption.es);
          accountConfigs.push({ account_id: accountId, caption: caption.es });
        } catch {
          accountConfigs.push({ account_id: accountId, caption: item.name });
        }
        captionsDone++;
        setProgress({ current: captionsDone, total: totalCaptions });
        if (captionsDone < totalCaptions) await delay(1000);
      }

      map.set(item.id, 'creating');
      setStatuses(new Map(map));

      try {
        const mainCaption = accountConfigs[0]?.caption ?? item.name;
        const dto: CreatePostDto = {
          caption: mainCaption,
          social_accounts: accounts,
          media: [item.mediaId],
          scheduled_at: item.scheduledAt ?? undefined,
          platform_configurations: platformConfig,
          account_configurations: accountConfigs,
        };
        await postsService.create(dto);
        map.set(item.id, 'done');
      } catch {
        map.set(item.id, 'error');
      }
      setStatuses(new Map(map));
    }

    setSubmitting(false);
    setDone(true);
  };

  return (
    <div id="bulk-review-034" className="space-y-4">
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">#</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">{t('bulk.video')}</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">{t('posts.schedule')}</th>
              <th className="text-center px-3 py-2 text-xs font-medium text-muted-foreground w-10">{t('bulk.status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item, i) => (
              <tr key={item.id}>
                <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                <td className="px-3 py-2 truncate max-w-[200px]">{item.name}</td>
                <td className="px-3 py-2 text-xs hidden sm:table-cell">{item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : t('bulk.schedule_now')}</td>
                <td className="px-3 py-2 text-center"><StatusIcon status={statuses.get(item.id)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {done ? (
        <div className="text-center space-y-3 py-4">
          <p className="text-sm font-medium">
            {t('bulk.resultSummary', { success: successCount, error: errorCount, total: items.length })}
          </p>
          <button
            id="bulk-view-posts-035"
            onClick={() => navigate('/posts')}
            className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90"
          >
            {t('bulk.viewPosts')}
          </button>
        </div>
      ) : (
        <button
          id="bulk-submit-036"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? (
            <><Loader2 size={16} className="animate-spin" /> {t('bulk.creating')} ({progress.current}/{progress.total})</>
          ) : (
            <><Send size={16} /> {t('bulk.createAll', { count: items.length })}</>
          )}
        </button>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status?: ItemStatus }) {
  if (!status || status === 'pending') return <Clock size={16} className="text-muted-foreground mx-auto" />;
  if (status === 'captioning') return <Sparkles size={16} className="animate-pulse text-amber-500 mx-auto" />;
  if (status === 'creating') return <Loader2 size={16} className="animate-spin text-primary mx-auto" />;
  if (status === 'done') return <CheckCircle size={16} className="text-green-500 mx-auto" />;
  return <XCircle size={16} className="text-red-500 mx-auto" />;
}
