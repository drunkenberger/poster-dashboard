import { useTranslation } from 'react-i18next';
import type { SlideStyle } from '../../stores/carouselStore.ts';

export interface StylePreset {
  id: string;
  labelKey: string;
  preview: { bg: string; text: string };
  style: SlideStyle;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'clean',
    labelKey: 'carousel.clean',
    preview: { bg: '#374151', text: '#FFFFFF' },
    style: {
      fontFamily: 'modern', fontSize: 72, fontColor: '#FFFFFF',
      textPosition: 'center', textAlign: 'center',
      textShadow: true, textOutline: false,
      bgOverlay: true, bgOverlayColor: '#000000', bgOverlayOpacity: 0.3,
    },
  },
  {
    id: 'bold',
    labelKey: 'carousel.boldPreset',
    preview: { bg: '#1F2937', text: '#FFFFFF' },
    style: {
      fontFamily: 'bold', fontSize: 96, fontColor: '#FFFFFF',
      textPosition: 'center', textAlign: 'center',
      textShadow: true, textOutline: true,
      bgOverlay: true, bgOverlayColor: '#000000', bgOverlayOpacity: 0.5,
    },
  },
  {
    id: 'minimal',
    labelKey: 'carousel.minimal',
    preview: { bg: '#4B5563', text: '#FFFFFF' },
    style: {
      fontFamily: 'modern', fontSize: 56, fontColor: '#FFFFFF',
      textPosition: 'bottom', textAlign: 'left',
      textShadow: true, textOutline: false,
      bgOverlay: false, bgOverlayColor: '#000000', bgOverlayOpacity: 0,
    },
  },
  {
    id: 'elegant',
    labelKey: 'carousel.elegant',
    preview: { bg: '#1A1A2E', text: '#F5F0E8' },
    style: {
      fontFamily: 'serif', fontSize: 68, fontColor: '#F5F0E8',
      textPosition: 'center', textAlign: 'center',
      textShadow: true, textOutline: false,
      bgOverlay: true, bgOverlayColor: '#1A1A2E', bgOverlayOpacity: 0.4,
    },
  },
  {
    id: 'neon',
    labelKey: 'carousel.neon',
    preview: { bg: '#0F172A', text: '#00FF88' },
    style: {
      fontFamily: 'bold', fontSize: 80, fontColor: '#00FF88',
      textPosition: 'center', textAlign: 'center',
      textShadow: true, textOutline: false,
      bgOverlay: true, bgOverlayColor: '#000000', bgOverlayOpacity: 0.6,
    },
  },
  {
    id: 'handwritten',
    labelKey: 'carousel.handwrittenPreset',
    preview: { bg: '#292524', text: '#FDE68A' },
    style: {
      fontFamily: 'handwritten', fontSize: 76, fontColor: '#FDE68A',
      textPosition: 'center', textAlign: 'center',
      textShadow: true, textOutline: false,
      bgOverlay: true, bgOverlayColor: '#000000', bgOverlayOpacity: 0.3,
    },
  },
];

interface StylePresetsProps {
  activePreset: string | null;
  onSelect: (preset: StylePreset) => void;
}

export default function StylePresetsGrid({ activePreset, onSelect }: StylePresetsProps) {
  const { t } = useTranslation();

  return (
    <div id="carousel-style-presets-069" className="space-y-2">
      <span className="text-xs font-medium text-muted-foreground">{t('carousel.presets')}</span>
      <div className="grid grid-cols-3 gap-2">
        {STYLE_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className={`p-3 rounded-lg border-2 transition-colors text-center ${
              activePreset === p.id
                ? 'border-primary'
                : 'border-border hover:border-muted-foreground/30'
            }`}
          >
            <div
              className="w-full aspect-[9/16] rounded mb-1.5 flex items-center justify-center"
              style={{ backgroundColor: p.preview.bg }}
            >
              <span
                className="text-[10px] font-bold leading-tight"
                style={{ color: p.preview.text }}
              >
                Aa
              </span>
            </div>
            <span className="text-xs">{t(p.labelKey)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
