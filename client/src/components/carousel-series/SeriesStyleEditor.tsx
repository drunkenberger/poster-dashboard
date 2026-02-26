import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBulkCarouselStore } from '../../stores/bulkCarouselStore.ts';
import CarouselTabs from './CarouselTabs.tsx';
import SlideCanvas from '../carousel/SlideCanvas.tsx';
import StylePresetsGrid from '../carousel/StylePresets.tsx';
import type { StylePreset } from '../carousel/StylePresets.tsx';
import StyleControls from '../carousel/StyleControls.tsx';

interface SeriesStyleEditorProps {
  onApprove: () => void;
  onBack: () => void;
}

export default function SeriesStyleEditor({ onApprove, onBack }: SeriesStyleEditorProps) {
  const { t } = useTranslation();
  const {
    carousels, activeCarousel, activeSlide,
    setActiveCarousel, setActiveSlide,
    updateSlideStyle, setGlobalStyle, applyStyleToAll,
  } = useBulkCarouselStore();
  const [activePreset, setActivePreset] = useState<string | null>('clean');

  const carousel = carousels.find((c) => c.carouselIndex === activeCarousel);
  const slide = carousel?.slides.find((s) => s.slideNumber === activeSlide) ?? carousel?.slides[0];
  if (!carousel || !slide) return null;

  const handlePreset = (preset: StylePreset) => {
    setActivePreset(preset.id);
    setGlobalStyle(preset.style);
    updateSlideStyle(carousel.carouselIndex, slide.slideNumber, preset.style);
  };

  const handleStyleChange = (partial: Record<string, unknown>) => {
    setActivePreset(null);
    updateSlideStyle(carousel.carouselIndex, slide.slideNumber, partial);
  };

  const handleApplyAll = () => {
    setGlobalStyle(slide.style);
    applyStyleToAll();
  };

  return (
    <div id="series-style-editor-083" className="space-y-4">
      <CarouselTabs carousels={carousels} activeIndex={activeCarousel} onChange={setActiveCarousel} />

      <div className="flex items-center justify-center gap-4">
        <button onClick={() => setActiveSlide(Math.max(1, activeSlide - 1))} disabled={activeSlide <= 1} className="p-1 rounded hover:bg-muted disabled:opacity-30">
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium">
          {t('carousel.slideOf', { current: activeSlide, total: carousel.slides.length })}
        </span>
        <button onClick={() => setActiveSlide(Math.min(carousel.slides.length, activeSlide + 1))} disabled={activeSlide >= carousel.slides.length} className="p-1 rounded hover:bg-muted disabled:opacity-30">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex justify-center">
          <SlideCanvas imageUrl={slide.imageUrl} text={slide.text} subtitle={slide.subtitle} style={slide.style} />
        </div>
        <div className="w-full md:w-64 space-y-4 overflow-y-auto max-h-[70vh]">
          <StylePresetsGrid activePreset={activePreset} onSelect={handlePreset} />
          <StyleControls style={slide.style} onChange={handleStyleChange} onApplyAll={handleApplyAll} />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 pt-2">
        {carousel.slides.map((s) => (
          <button
            key={s.slideNumber}
            onClick={() => setActiveSlide(s.slideNumber)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              s.slideNumber === activeSlide ? 'bg-primary' : 'bg-border hover:bg-muted-foreground'
            }`}
          />
        ))}
      </div>

      <div className="flex justify-between pt-4 border-t border-border">
        <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-sm rounded-md border border-border hover:bg-muted">
          <ArrowLeft size={16} /> {t('carousel.back')}
        </button>
        <button onClick={onApprove} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90">
          {t('carousel.approveStyles')} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
