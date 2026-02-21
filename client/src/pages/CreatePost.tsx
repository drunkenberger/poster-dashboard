import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send, Loader2, Save, Film, X } from 'lucide-react';
import { postsService } from '../services/posts.ts';
import { useMediaUpload } from '../hooks/useMediaUpload.ts';
import { useAccountsStore } from '../stores/accountsStore.ts';
import MediaUploader from '../components/media/MediaUploader.tsx';
import AccountSelector from '../components/accounts/AccountSelector.tsx';
import SchedulePicker from '../components/posts/SchedulePicker.tsx';
import PlatformOptions from '../components/posts/PlatformOptions.tsx';
import AccountOverrides from '../components/posts/AccountOverrides.tsx';
import { toast } from '../components/ui/Toast.tsx';
import type { PlatformConfigurations, AccountConfiguration } from '../../../shared/types/index.ts';

export default function CreatePost() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { accounts } = useAccountsStore();
  const [caption, setCaption] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [platformConfig, setPlatformConfig] = useState<PlatformConfigurations>({});
  const [accountOverrides, setAccountOverrides] = useState<AccountConfiguration[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [driveMediaIds, setDriveMediaIds] = useState<string[]>([]);
  const { files, upload, remove, mediaIds } = useMediaUpload();

  useEffect(() => {
    const mediaParam = searchParams.get('media');
    if (mediaParam) setDriveMediaIds(mediaParam.split(','));
    const captionParam = searchParams.get('caption');
    if (captionParam) setCaption(captionParam);
  }, [searchParams]);

  const allMediaIds = [...driveMediaIds, ...mediaIds];
  const canSubmit = caption.trim().length > 0 && selectedAccounts.length > 0 && !submitting;

  const buildPlatformConfig = (): PlatformConfigurations | undefined => {
    const cleaned: PlatformConfigurations = {};
    if (platformConfig.instagram) {
      const ig = { ...platformConfig.instagram };
      if (!ig.caption) delete ig.caption;
      if (Object.keys(ig).length > 0) cleaned.instagram = ig;
    }
    if (platformConfig.tiktok) {
      const tt = { ...platformConfig.tiktok };
      if (!tt.caption) delete tt.caption;
      if (!tt.title) delete tt.title;
      if (Object.keys(tt).length > 0) cleaned.tiktok = tt;
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  };

  const handleSubmit = async (asDraft = false) => {
    if (!canSubmit && !asDraft) return;
    if (asDraft && caption.trim().length === 0) return;
    setSubmitting(true);

    try {
      await postsService.create({
        caption: caption.trim(),
        social_accounts: selectedAccounts,
        media: allMediaIds.length > 0 ? allMediaIds : undefined,
        scheduled_at: asDraft ? undefined : (scheduledAt ?? undefined),
        is_draft: asDraft || undefined,
        platform_configurations: buildPlatformConfig(),
        account_configurations: accountOverrides.length > 0 ? accountOverrides : undefined,
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

        {driveMediaIds.length > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Film size={16} className="text-primary" />
            <span className="text-sm text-foreground flex-1">{t('drive.mediaAttached')}</span>
            <button
              onClick={() => setDriveMediaIds([])}
              className="p-1 rounded hover:bg-muted text-muted-foreground"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <MediaUploader files={files} onUpload={upload} onRemove={remove} />
        <AccountSelector selected={selectedAccounts} onChange={setSelectedAccounts} />
        <PlatformOptions
          accounts={accounts}
          selectedAccountIds={selectedAccounts}
          config={platformConfig}
          onChange={setPlatformConfig}
        />
        <AccountOverrides
          accounts={accounts}
          selectedAccountIds={selectedAccounts}
          overrides={accountOverrides}
          onChange={setAccountOverrides}
        />
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
