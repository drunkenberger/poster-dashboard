import { useTranslation } from 'react-i18next';
import type { SlideStyle, FontFamily, TextPosition, TextAlign } from '../../stores/carouselStore.ts';

interface StyleControlsProps {
  style: SlideStyle;
  onChange: (partial: Partial<SlideStyle>) => void;
  onApplyAll: () => void;
}

const FONTS: { value: FontFamily; labelKey: string }[] = [
  { value: 'modern', labelKey: 'carousel.modern' },
  { value: 'serif', labelKey: 'carousel.serif' },
  { value: 'bold', labelKey: 'carousel.bold' },
  { value: 'handwritten', labelKey: 'carousel.handwritten' },
];

const POSITIONS: { value: TextPosition; labelKey: string }[] = [
  { value: 'top', labelKey: 'carousel.top' },
  { value: 'center', labelKey: 'carousel.center' },
  { value: 'bottom', labelKey: 'carousel.bottom' },
];

const ALIGNS: { value: TextAlign; labelKey: string }[] = [
  { value: 'left', labelKey: 'carousel.left' },
  { value: 'center', labelKey: 'carousel.center' },
  { value: 'right', labelKey: 'carousel.right' },
];

export default function StyleControls({ style, onChange, onApplyAll }: StyleControlsProps) {
  const { t } = useTranslation();

  return (
    <div id="carousel-style-controls-070" className="space-y-4">
      <SegmentControl
        label={t('carousel.fontFamily')}
        options={FONTS.map((f) => ({ value: f.value, label: t(f.labelKey) }))}
        value={style.fontFamily}
        onChange={(v) => onChange({ fontFamily: v as FontFamily })}
      />

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          {t('carousel.fontSize')}: {style.fontSize}px
        </label>
        <input
          type="range"
          min={32}
          max={120}
          value={style.fontSize}
          onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          {t('carousel.fontColor')}
        </label>
        <input
          type="color"
          value={style.fontColor}
          onChange={(e) => onChange({ fontColor: e.target.value })}
          className="w-10 h-8 rounded border border-border cursor-pointer"
        />
      </div>

      <SegmentControl
        label={t('carousel.textPosition')}
        options={POSITIONS.map((p) => ({ value: p.value, label: t(p.labelKey) }))}
        value={style.textPosition}
        onChange={(v) => onChange({ textPosition: v as TextPosition })}
      />

      <SegmentControl
        label={t('carousel.textAlign')}
        options={ALIGNS.map((a) => ({ value: a.value, label: t(a.labelKey) }))}
        value={style.textAlign}
        onChange={(v) => onChange({ textAlign: v as TextAlign })}
      />

      <ToggleRow
        label={t('carousel.textShadow')}
        checked={style.textShadow}
        onChange={(v) => onChange({ textShadow: v })}
      />
      <ToggleRow
        label={t('carousel.textOutline')}
        checked={style.textOutline}
        onChange={(v) => onChange({ textOutline: v })}
      />
      <ToggleRow
        label={t('carousel.bgOverlay')}
        checked={style.bgOverlay}
        onChange={(v) => onChange({ bgOverlay: v })}
      />

      {style.bgOverlay && (
        <div className="space-y-1 pl-4">
          <label className="text-xs text-muted-foreground">
            {t('carousel.overlayOpacity')}: {Math.round(style.bgOverlayOpacity * 100)}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(style.bgOverlayOpacity * 100)}
            onChange={(e) => onChange({ bgOverlayOpacity: Number(e.target.value) / 100 })}
            className="w-full accent-primary"
          />
        </div>
      )}

      <button
        onClick={onApplyAll}
        className="w-full px-3 py-2 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors"
      >
        {t('carousel.applyToAll')}
      </button>
    </div>
  );
}

function SegmentControl({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex rounded-lg border border-border overflow-hidden">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 px-2 py-1.5 text-xs font-medium transition-colors ${
              value === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-muted'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded accent-primary"
      />
    </label>
  );
}
