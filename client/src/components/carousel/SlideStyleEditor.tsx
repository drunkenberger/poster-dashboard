import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCarouselStore } from '../../stores/carouselStore.ts';
import SlideCanvas from './SlideCanvas.tsx';
import StylePresetsGrid, { STYLE_PRESETS } from './StylePresets.tsx';
import type { StylePreset } from './StylePresets.tsx';
import StyleControls from './StyleControls.tsx';

interface SlideStyleEditorProps {
  onApprove: () => void;
  onBack: () => void;
}

export default function SlideStyleEditor({ onApprove, onBack }: SlideStyleEditorProps) {
  const { t } = useTranslation();
  const {
    slides,
    activeSlide,
    setActiveSlide,
    updateSlideStyle,
    setGlobalStyle,
    applyStyleToAll,
  } = useCarouselStore();
  const [activePreset, setActivePreset] = useState<string | null>('clean');

  const current = slides.find((s) => s.slideNumber === activeSlide) ?? slides[0];
  if (!current) return null;

  const handlePreset = (preset: StylePreset) => {
    setActivePreset(preset.id);
    setGlobalStyle(preset.style);
    updateSlideStyle(current.slideNumber, preset.style);
  };

  const handleStyleChange = (partial: Record<string, unknown>) => {
    setActivePreset(null);
    updateSlideStyle(current.slideNumber, partial);
  };

  const handleApplyAll = () => {
    setGlobalStyle(current.style);
    applyStyleToAll();
  };

  const goPrev = () => setActiveSlide(Math.max(1, activeSlide - 1));
  const goNext = () => setActiveSlide(Math.min(slides.length, activeSlide + 1));

  return (
    <div className="space-y-4">
      <div id="carousel-slide-nav-072" className="flex items-center justify-center gap-4">
        <button
          onClick={goPrev}
          disabled={activeSlide <= 1}
          className="p-1 rounded hover:bg-muted disabled:opacity-30"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium">
          {t('carousel.slideOf', { current: activeSlide, total: slides.length })}
        </span>
        <button
          onClick={goNext}
          disabled={activeSlide >= slides.length}
          className="p-1 rounded hover:bg-muted disabled:opacity-30"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex justify-center">
          <SlideCanvas
            imageUrl={current.imageUrl}
            text={current.text}
            subtitle={current.subtitle}
            style={current.style}
          />
        </div>

        <div className="w-full md:w-64 space-y-4 overflow-y-auto max-h-[70vh]">
          <StylePresetsGrid activePreset={activePreset} onSelect={handlePreset} />
          <StyleControls
            style={current.style}
            onChange={handleStyleChange}
            onApplyAll={handleApplyAll}
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 pt-2">
        {slides.map((s) => (
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
          {t('carousel.approveStyles')} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
