import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useBulkCarouselStore } from '../../stores/bulkCarouselStore.ts';
import CarouselTabs from './CarouselTabs.tsx';

interface SeriesTextEditorProps {
  onApprove: () => void;
  onBack: () => void;
}

export default function SeriesTextEditor({ onApprove, onBack }: SeriesTextEditorProps) {
  const { t } = useTranslation();
  const { carousels, activeCarousel, setActiveCarousel, updateSlideText } = useBulkCarouselStore();
  const current = carousels.find((c) => c.carouselIndex === activeCarousel);

  if (!current) return null;

  return (
    <div id="series-text-editor-081" className="space-y-4">
      <CarouselTabs carousels={carousels} activeIndex={activeCarousel} onChange={setActiveCarousel} />

      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
        <span className="text-sm font-medium">{current.subject}</span>
      </div>

      <div className="space-y-3 max-h-[50vh] overflow-y-auto">
        {current.slides.map((slide) => (
          <div key={slide.id} className="p-3 rounded-lg border border-border bg-card space-y-2">
            <span className="text-xs text-muted-foreground font-medium">Slide {slide.slideNumber}</span>
            <input
              type="text"
              value={slide.text}
              onChange={(e) => updateSlideText(current.carouselIndex, slide.slideNumber, e.target.value, slide.subtitle)}
              placeholder={t('carousel.slideTitle')}
              className="w-full px-3 py-1.5 rounded border border-border bg-background text-sm"
            />
            <input
              type="text"
              value={slide.subtitle}
              onChange={(e) => updateSlideText(current.carouselIndex, slide.slideNumber, slide.text, e.target.value)}
              placeholder={t('carousel.slideSubtitle')}
              className="w-full px-3 py-1.5 rounded border border-border bg-background text-xs text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground truncate">
              {t('carousel.imagePrompt')}: {slide.imagePrompt}
            </p>
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
          onClick={onApprove}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90"
        >
          {t('carousel.approveTexts')} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
