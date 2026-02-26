import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Send, RefreshCw, HardDrive } from 'lucide-react';
import { useCarouselStore } from '../../stores/carouselStore.ts';
import { mediaService } from '../../services/media.ts';
import { postsService } from '../../services/posts.ts';
import { carouselService } from '../../services/carousel.ts';
import { drawSlide, loadImage, canvasToBlob } from '../../utils/canvasDraw.ts';
import { toast } from '../ui/Toast.tsx';
import AccountSelector from '../accounts/AccountSelector.tsx';
import SlideCanvas from './SlideCanvas.tsx';
import DriveFolderPicker from './DriveFolderPicker.tsx';

interface CarouselPublishProps {
  onBack: () => void;
  language: 'es' | 'en';
  topic: string;
}

export default function CarouselPublish({ onBack, language, topic }: CarouselPublishProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { slides, sessionId, reset } = useCarouselStore();
  const [caption, setCaption] = useState('');
  const [captionLoading, setCaptionLoading] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [driveFolderId, setDriveFolderId] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const apiBase = import.meta.env.VITE_API_URL || '/api';

  const generateCaption = useCallback(async () => {
    setCaptionLoading(true);
    try {
      const slideData = slides.map((s) => ({ title: s.text, subtitle: s.subtitle }));
      setCaption(await carouselService.generateCaption(slideData, language));
    } catch { /* user can write manually */ }
    finally { setCaptionLoading(false); }
  }, [slides, language]);

  useEffect(() => { generateCaption(); }, [generateCaption]);

  const canPublish = selectedAccounts.length > 0 && !busy && caption.trim().length > 0;
  const canSave = driveFolderId && !busy && caption.trim().length > 0;

  const exportBlobs = async (): Promise<Blob[]> => {
    const canvas = document.createElement('canvas');
    const blobs: Blob[] = [];
    for (const slide of slides) {
      setProgress(t('carousel.exportingSlide', { n: slide.slideNumber }));
      const src = slide.imageUrl.startsWith('/api')
        ? `${apiBase}${slide.imageUrl.replace('/api', '')}` : slide.imageUrl;
      const img = await loadImage(src);
      drawSlide(canvas, img, slide.text, slide.subtitle, slide.style);
      blobs.push(await canvasToBlob(canvas));
    }
    return blobs;
  };

  const handleSaveToDrive = async () => {
    if (!canSave) return;
    setBusy(true);
    try {
      const blobs = await exportBlobs();
      setProgress(t('carousel.savingToDrive'));
      await carouselService.saveToDrive(driveFolderId, caption.trim(), topic, blobs);
      carouselService.cleanupSession(sessionId).catch(() => {});
      toast(t('carousel.saveSuccess'), 'success');
      reset();
      navigate('/');
    } catch {
      toast(t('carousel.saveError'), 'error');
    } finally {
      setBusy(false);
      setProgress('');
    }
  };

  const handlePublish = async () => {
    if (!canPublish) return;
    setBusy(true);
    try {
      const blobs = await exportBlobs();
      const mediaIds: string[] = [];
      for (let i = 0; i < blobs.length; i++) {
        setProgress(t('carousel.uploadingSlide', { n: i + 1 }));
        const file = new File([blobs[i]], `carousel-${i + 1}.png`, { type: 'image/png' });
        mediaIds.push(await mediaService.uploadFile(file));
      }
      if (driveFolderId) {
        setProgress(t('carousel.savingToDrive'));
        await carouselService.saveToDrive(driveFolderId, caption.trim(), topic, blobs);
      }
      setProgress(t('carousel.creatingPost'));
      await postsService.create({ caption: caption.trim(), social_accounts: selectedAccounts, media: mediaIds });
      carouselService.cleanupSession(sessionId).catch(() => {});
      toast(t('carousel.publishSuccess'), 'success');
      reset();
      navigate('/posts');
    } catch {
      toast(t('carousel.publishError'), 'error');
    } finally {
      setBusy(false);
      setProgress('');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {slides.map((slide) => (
          <div key={slide.id} className="flex-shrink-0">
            <SlideCanvas imageUrl={slide.imageUrl} text={slide.text} subtitle={slide.subtitle} style={slide.style} maxWidth={140} />
          </div>
        ))}
      </div>

      <CaptionSection caption={caption} loading={captionLoading} onChangeCaption={setCaption} onRegenerate={generateCaption} />
      <DriveFolderPicker selectedId={driveFolderId} onChange={setDriveFolderId} />
      <AccountSelector selected={selectedAccounts} onChange={setSelectedAccounts} />

      {progress && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Loader2 size={16} className="animate-spin text-primary" />
          <span className="text-sm">{progress}</span>
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-border">
        <button onClick={onBack} disabled={busy} className="flex items-center gap-2 px-4 py-2 text-sm rounded-md border border-border hover:bg-muted disabled:opacity-50">
          <ArrowLeft size={16} /> {t('carousel.back')}
        </button>
        <div className="flex gap-2">
          <button
            id="carousel-save-btn-086"
            onClick={handleSaveToDrive}
            disabled={!canSave}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy && !selectedAccounts.length ? <Loader2 size={16} className="animate-spin" /> : <HardDrive size={16} />}
            {t('carousel.saveToDrive')}
          </button>
          <button
            id="carousel-publish-btn-073"
            onClick={handlePublish}
            disabled={!canPublish}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy && selectedAccounts.length ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {t('carousel.publish')}
          </button>
        </div>
      </div>
    </div>
  );
}

function CaptionSection({
  caption, loading, onChangeCaption, onRegenerate,
}: {
  caption: string; loading: boolean;
  onChangeCaption: (v: string) => void; onRegenerate: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="carousel-caption-074" className="text-sm font-medium text-foreground">
          {t('carousel.caption')}
        </label>
        <button onClick={onRegenerate} disabled={loading} className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border border-border hover:bg-muted disabled:opacity-50 transition-colors">
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          {t('carousel.regenerateCaption')}
        </button>
      </div>
      {loading && !caption ? (
        <div className="w-full px-4 py-6 rounded-lg border border-border bg-muted/50 flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{t('carousel.generatingCaption')}</span>
        </div>
      ) : (
        <textarea
          id="carousel-caption-074"
          value={caption}
          onChange={(e) => onChangeCaption(e.target.value)}
          placeholder={t('carousel.captionPlaceholder')}
          rows={6}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      )}
      <p className="text-xs text-muted-foreground text-right">{caption.length} chars</p>
    </div>
  );
}
