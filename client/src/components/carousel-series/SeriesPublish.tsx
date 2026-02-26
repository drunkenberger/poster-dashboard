import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Send, RefreshCw, HardDrive } from 'lucide-react';
import { useBulkCarouselStore } from '../../stores/bulkCarouselStore.ts';
import { carouselService } from '../../services/carousel.ts';
import { mediaService } from '../../services/media.ts';
import { postsService } from '../../services/posts.ts';
import { drawSlide, loadImage, canvasToBlob } from '../../utils/canvasDraw.ts';
import { toast } from '../ui/Toast.tsx';
import AccountSelector from '../accounts/AccountSelector.tsx';
import DriveFolderPicker from '../carousel/DriveFolderPicker.tsx';
import CarouselTabs from './CarouselTabs.tsx';
import SlideCanvas from '../carousel/SlideCanvas.tsx';

interface SeriesPublishProps {
  onBack: () => void;
  language: 'es' | 'en';
  topic: string;
}

export default function SeriesPublish({ onBack, language, topic }: SeriesPublishProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { carousels, sessionId, activeCarousel, setActiveCarousel, setCaption, setCaptionLoading, reset } =
    useBulkCarouselStore();
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [driveFolderId, setDriveFolderId] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const apiBase = import.meta.env.VITE_API_URL || '/api';

  const generateCaptions = useCallback(async () => {
    for (const c of carousels) {
      if (c.caption) continue;
      setCaptionLoading(c.carouselIndex, true);
      try {
        const slideData = c.slides.map((s) => ({ title: s.text, subtitle: s.subtitle }));
        const series = { subject: c.subject, seriesName: topic, part: c.carouselIndex, total: carousels.length };
        setCaption(c.carouselIndex, await carouselService.generateCaption(slideData, language, series));
      } catch { /* user can write manually */ }
      finally { setCaptionLoading(c.carouselIndex, false); }
    }
  }, [carousels, language, topic, setCaption, setCaptionLoading]);

  useEffect(() => { generateCaptions(); }, []);

  const current = carousels.find((c) => c.carouselIndex === activeCarousel);
  const allCaptionsReady = carousels.every((c) => c.caption.trim());
  const canPublish = selectedAccounts.length > 0 && !busy && allCaptionsReady;
  const canSave = driveFolderId && !busy && allCaptionsReady;

  const handleSaveToDrive = async () => {
    if (!canSave) return;
    setBusy(true);
    try {
      const parentFolder = await carouselService.createDriveFolder(`Serie - ${topic}`, driveFolderId);
      for (const c of carousels) {
        setProgress(t('bulkCarousel.savingCarousel', { n: c.carouselIndex, total: carousels.length }));
        const blobs = await exportBlobs(c, apiBase);
        await carouselService.saveToDrive(parentFolder, c.caption.trim(), `${topic} - ${c.subject}`, blobs);
      }
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
      let parentDriveFolder = '';
      if (driveFolderId) {
        parentDriveFolder = await carouselService.createDriveFolder(`Serie - ${topic}`, driveFolderId);
      }
      for (const c of carousels) {
        setProgress(t('bulkCarousel.publishingCarousel', { n: c.carouselIndex, total: carousels.length }));
        const { blobs, mediaIds } = await exportCarouselSlides(c, apiBase);
        if (parentDriveFolder) {
          setProgress(t('carousel.savingToDrive'));
          await carouselService.saveToDrive(parentDriveFolder, c.caption.trim(), `${topic} - ${c.subject}`, blobs);
        }
        await postsService.create({ caption: c.caption.trim(), social_accounts: selectedAccounts, media: mediaIds });
      }
      carouselService.cleanupSession(sessionId).catch(() => {});
      toast(t('bulkCarousel.publishSuccess'), 'success');
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
      <CarouselTabs carousels={carousels} activeIndex={activeCarousel} onChange={setActiveCarousel} />
      {current && <CarouselPreviewAndCaption carousel={current} apiBase={apiBase} language={language} topic={topic} />}
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
            id="series-save-btn-087"
            onClick={handleSaveToDrive}
            disabled={!canSave}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HardDrive size={16} /> {t('carousel.saveToDrive')}
          </button>
          <button
            id="series-publish-btn-084"
            onClick={handlePublish}
            disabled={!canPublish}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {t('bulkCarousel.publishAll')}
          </button>
        </div>
      </div>
    </div>
  );
}

function CarouselPreviewAndCaption({
  carousel, apiBase, language, topic,
}: { carousel: ReturnType<typeof useBulkCarouselStore.getState>['carousels'][number]; apiBase: string; language: 'es' | 'en'; topic: string }) {
  const { t } = useTranslation();
  const { setCaption, setCaptionLoading } = useBulkCarouselStore();

  const regenerate = async () => {
    setCaptionLoading(carousel.carouselIndex, true);
    try {
      const slideData = carousel.slides.map((s) => ({ title: s.text, subtitle: s.subtitle }));
      const series = { subject: carousel.subject, seriesName: topic, part: carousel.carouselIndex, total: 0 };
      setCaption(carousel.carouselIndex, await carouselService.generateCaption(slideData, language, series));
    } catch { /* noop */ }
    finally { setCaptionLoading(carousel.carouselIndex, false); }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {carousel.slides.map((s) => (
          <div key={s.id} className="flex-shrink-0">
            <SlideCanvas imageUrl={s.imageUrl} text={s.text} subtitle={s.subtitle} style={s.style} maxWidth={120} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{carousel.subject}</label>
        <button onClick={regenerate} disabled={carousel.captionLoading} className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border border-border hover:bg-muted disabled:opacity-50">
          {carousel.captionLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          {t('carousel.regenerateCaption')}
        </button>
      </div>
      {carousel.captionLoading && !carousel.caption ? (
        <div className="w-full px-4 py-4 rounded-lg border border-border bg-muted/50 flex items-center justify-center gap-2">
          <Loader2 size={14} className="animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{t('carousel.generatingCaption')}</span>
        </div>
      ) : (
        <textarea
          value={carousel.caption}
          onChange={(e) => setCaption(carousel.carouselIndex, e.target.value)}
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      )}
    </div>
  );
}

type SlideData = { imageUrl: string; text: string; subtitle: string; style: any; slideNumber: number };

async function exportBlobs(c: { slides: SlideData[] }, apiBase: string): Promise<Blob[]> {
  const canvas = document.createElement('canvas');
  const blobs: Blob[] = [];
  for (const slide of c.slides) {
    const src = slide.imageUrl.startsWith('/api') ? `${apiBase}${slide.imageUrl.replace('/api', '')}` : slide.imageUrl;
    const img = await loadImage(src);
    drawSlide(canvas, img, slide.text, slide.subtitle, slide.style);
    blobs.push(await canvasToBlob(canvas));
  }
  return blobs;
}

async function exportCarouselSlides(
  c: { slides: SlideData[] }, apiBase: string,
): Promise<{ blobs: Blob[]; mediaIds: string[] }> {
  const blobs = await exportBlobs(c, apiBase);
  const mediaIds: string[] = [];
  for (let i = 0; i < blobs.length; i++) {
    const file = new File([blobs[i]], `carousel-${c.slides[i].slideNumber}.png`, { type: 'image/png' });
    mediaIds.push(await mediaService.uploadFile(file));
  }
  return { blobs, mediaIds };
}
