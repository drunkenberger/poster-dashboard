import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send, Loader2, Save } from 'lucide-react';
import { postsService } from '../services/posts.ts';
import { useMediaUpload } from '../hooks/useMediaUpload.ts';
import MediaUploader from '../components/media/MediaUploader.tsx';
import AccountSelector from '../components/accounts/AccountSelector.tsx';
import SchedulePicker from '../components/posts/SchedulePicker.tsx';
import { toast } from '../components/ui/Toast.tsx';

export default function CreatePost() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { files, upload, remove, mediaIds } = useMediaUpload();

  const canSubmit = caption.trim().length > 0 && selectedAccounts.length > 0 && !submitting;

  const handleSubmit = async (asDraft = false) => {
    if (!canSubmit && !asDraft) return;
    if (asDraft && caption.trim().length === 0) return;
    setSubmitting(true);

    try {
      await postsService.create({
        caption: caption.trim(),
        social_accounts: selectedAccounts,
        media: mediaIds.length > 0 ? mediaIds : undefined,
        scheduled_at: asDraft ? undefined : (scheduledAt ?? undefined),
        is_draft: asDraft || undefined,
      });

      const msg = asDraft
        ? t('posts.draftSuccess')
        : scheduledAt
          ? t('posts.scheduleSuccess')
          : t('posts.publishSuccess');
      toast(msg, 'success');
      navigate('/posts');
    } catch {
      toast(t('posts.publishError'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{t('posts.newPost')}</h2>

      <div className="space-y-6">
        <CaptionEditor caption={caption} onChange={setCaption} />
        <MediaUploader files={files} onUpload={upload} onRemove={remove} />
        <AccountSelector selected={selectedAccounts} onChange={setSelectedAccounts} />
        <SchedulePicker scheduledAt={scheduledAt} onChange={setScheduledAt} />

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            id="post-draft-btn-013"
            onClick={() => handleSubmit(true)}
            disabled={submitting || caption.trim().length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {t('posts.saveDraft')}
          </button>

          <button
            id="post-publish-btn-008"
            onClick={() => handleSubmit(false)}
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {scheduledAt ? t('posts.schedule') : t('posts.publishNow')}
          </button>
        </div>
      </div>
    </div>
  );
}

function CaptionEditor({ caption, onChange }: { caption: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <label htmlFor="caption-input-009" className="text-sm font-medium text-foreground">
        {t('posts.caption')}
      </label>
      <textarea
        id="caption-input-009"
        value={caption}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('posts.captionPlaceholder')}
        rows={5}
        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      <p className="text-xs text-muted-foreground text-right">{caption.length} chars</p>
    </div>
  );
}
