import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { useBulkCarouselStore } from '../../stores/bulkCarouselStore.ts';
import CarouselTabs from './CarouselTabs.tsx';

interface SeriesImageReviewProps {
  onApprove: () => void;
  onBack: () => void;
  onRegenerate: (ci: number, sn: number) => void;
  doneCount: number;
  totalCount: number;
}

export default function SeriesImageReview({
  onApprove, onBack, onRegenerate, doneCount, totalCount,
}: SeriesImageReviewProps) {
  const { t } = useTranslation();
  const { carousels, activeCarousel, setActiveCarousel } = useBulkCarouselStore();
  const current = carousels.find((c) => c.carouselIndex === activeCarousel);

  const allDone = doneCount >= totalCount && totalCount > 0;
  const apiBase = import.meta.env.VITE_API_URL || '/api';

  return (
    <div id="series-image-review-082" className="space-y-4">
      {!allDone && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Loader2 size={16} className="animate-spin text-primary" />
          <span className="text-sm">
            {t('carousel.generatingImages', { current: doneCount + 1, total: totalCount })}
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(doneCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      <CarouselTabs carousels={carousels} activeIndex={activeCarousel} onChange={setActiveCarousel} />

      {current && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {current.slides.map((slide) => (
            <div key={slide.id} className="relative group rounded-lg overflow-hidden border border-border">
              {slide.imageLoading ? (
                <div className="aspect-[9/16] bg-muted flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-muted-foreground" />
                </div>
              ) : slide.imageUrl ? (
                <img
                  src={slide.imageUrl.startsWith('/api')
                    ? `${apiBase}${slide.imageUrl.replace('/api', '')}`
                    : slide.imageUrl}
                  alt={`Slide ${slide.slideNumber}`}
                  className="w-full aspect-[9/16] object-cover"
                />
              ) : (
                <div className="aspect-[9/16] bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  Pending
                </div>
              )}
              {slide.imageUrl && !slide.imageLoading && (
                <button
                  onClick={() => onRegenerate(current.carouselIndex, slide.slideNumber)}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <RefreshCw size={14} />
                </button>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/50 text-white text-xs truncate">
                {slide.text}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-border">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-md border border-border hover:bg-muted"
        >
          <ArrowLeft size={16} /> {t('carousel.back')}
        </button>
        <button
          onClick={onApprove}
          disabled={!allDone}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('carousel.approveImages')} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
