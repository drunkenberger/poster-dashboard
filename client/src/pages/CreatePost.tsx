import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send, Loader2 } from 'lucide-react';
import { postsService } from '../services/posts.ts';
import { useMediaUpload } from '../hooks/useMediaUpload.ts';
import MediaUploader from '../components/media/MediaUploader.tsx';
import AccountSelector from '../components/accounts/AccountSelector.tsx';
import { toast } from '../components/ui/Toast.tsx';

export default function CreatePost() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [publishing, setPublishing] = useState(false);
  const { files, upload, remove, mediaIds } = useMediaUpload();

  const canPublish = caption.trim().length > 0 && selectedAccounts.length > 0 && !publishing;

  const handlePublish = async () => {
    if (!canPublish) return;
    setPublishing(true);

    try {
      await postsService.create({
        caption: caption.trim(),
        social_accounts: selectedAccounts,
        media: mediaIds.length > 0 ? mediaIds : undefined,
      });
      toast(t('posts.publishSuccess') || 'Post published!', 'success');
      navigate('/posts');
    } catch {
      toast(t('posts.publishError') || 'Failed to publish', 'error');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{t('posts.newPost')}</h2>

      <div className="space-y-6">
        <CaptionEditor caption={caption} onChange={setCaption} />
        <MediaUploader files={files} onUpload={upload} onRemove={remove} />
        <AccountSelector selected={selectedAccounts} onChange={setSelectedAccounts} />

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {selectedAccounts.length} {t('posts.selectAccounts').toLowerCase()}
            {mediaIds.length > 0 && ` · ${mediaIds.length} media`}
          </div>

          <button
            id="post-publish-btn-008"
            onClick={handlePublish}
            disabled={!canPublish}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {publishing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {t('posts.publishNow')}
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
      <label htmlFor="caption-input" className="text-sm font-medium text-foreground">
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
