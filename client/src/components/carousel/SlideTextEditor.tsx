import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCarouselStore } from '../../stores/carouselStore.ts';

interface SlideTextEditorProps {
  onApprove: () => void;
  onBack: () => void;
}

export default function SlideTextEditor({ onApprove, onBack }: SlideTextEditorProps) {
  const { t } = useTranslation();
  const { slides, updateSlideText } = useCarouselStore();

  return (
    <div id="carousel-text-editor-065" className="space-y-4">
      <div className="space-y-3">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="p-4 rounded-lg border border-border bg-card space-y-3"
          >
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {slide.slideNumber}
              </span>
              <span className="text-xs text-muted-foreground">
                {t('carousel.slideOf', {
                  current: slide.slideNumber,
                  total: slides.length,
                })}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                {t('carousel.slideTitle')}
              </label>
              <input
                value={slide.text}
                onChange={(e) =>
                  updateSlideText(slide.slideNumber, e.target.value, slide.subtitle)
                }
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                {t('carousel.slideSubtitle')}
              </label>
              <input
                value={slide.subtitle}
                onChange={(e) =>
                  updateSlideText(slide.slideNumber, slide.text, e.target.value)
                }
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
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
          id="carousel-approve-texts-066"
          onClick={onApprove}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90"
        >
          {t('carousel.approveTexts')} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
