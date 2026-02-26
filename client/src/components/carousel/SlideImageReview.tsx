import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { useCarouselStore } from '../../stores/carouselStore.ts';

interface SlideImageReviewProps {
  onApprove: () => void;
  onBack: () => void;
  onRegenerate: (slideNumber: number) => void;
  generatingCount: number;
  totalCount: number;
}

export default function SlideImageReview({
  onApprove,
  onBack,
  onRegenerate,
  generatingCount,
  totalCount,
}: SlideImageReviewProps) {
  const { t } = useTranslation();
  const { slides } = useCarouselStore();
  const allDone = slides.every((s) => s.imageUrl && !s.imageLoading);
  const apiBase = import.meta.env.VITE_API_URL || '/api';

  return (
    <div id="carousel-image-grid-067" className="space-y-4">
      {generatingCount < totalCount && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Loader2 size={16} className="animate-spin text-primary" />
          <span className="text-sm">
            {t('carousel.generatingImages', {
              current: generatingCount + 1,
              total: totalCount,
            })}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="relative rounded-lg border border-border overflow-hidden bg-card"
          >
            <div className="aspect-[9/16]">
              {slide.imageLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Loader2 size={24} className="animate-spin text-muted-foreground" />
                </div>
              ) : slide.imageUrl ? (
                <img
                  src={`${apiBase}${slide.imageUrl.replace('/api', '')}`}
                  alt={`Slide ${slide.slideNumber}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-xs text-muted-foreground">Pending</span>
                </div>
              )}
            </div>

            <div className="absolute top-2 left-2 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white text-xs font-bold">
              {slide.slideNumber}
            </div>

            {slide.imageUrl && !slide.imageLoading && (
              <button
                onClick={() => onRegenerate(slide.slideNumber)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                title={t('carousel.regenerate')}
              >
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4 border-t border-border">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-md border border-border hover:bg-muted"
        >
          <ArrowLeft size={16} /> {t('carousel.back')}
        </button>
        <button
          id="carousel-approve-images-068"
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
