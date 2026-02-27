import { useTranslation } from 'react-i18next';

export type ImageStyleId =
  | 'photorealistic' | '3d-render' | 'watercolor' | 'abstract' | 'cartoon'
  | 'anime' | 'neon' | 'minimalist' | 'vintage' | 'oil-painting';

const STYLES: { id: ImageStyleId; bg: string }[] = [
  { id: 'photorealistic', bg: 'linear-gradient(135deg, #334155, #64748b)' },
  { id: '3d-render', bg: 'linear-gradient(135deg, #4f46e5, #a855f7)' },
  { id: 'watercolor', bg: 'linear-gradient(135deg, #38bdf8, #fda4af)' },
  { id: 'abstract', bg: 'linear-gradient(135deg, #f97316, #ec4899)' },
  { id: 'cartoon', bg: 'linear-gradient(135deg, #facc15, #4ade80)' },
  { id: 'anime', bg: 'linear-gradient(135deg, #ec4899, #8b5cf6)' },
  { id: 'neon', bg: 'linear-gradient(135deg, #06b6d4, #d946ef)' },
  { id: 'minimalist', bg: 'linear-gradient(135deg, #d1d5db, #f3f4f6)' },
  { id: 'vintage', bg: 'linear-gradient(135deg, #b45309, #a16207)' },
  { id: 'oil-painting', bg: 'linear-gradient(135deg, #047857, #b45309)' },
];

interface Props {
  selected: ImageStyleId;
  onChange: (style: ImageStyleId) => void;
}

export default function ImageStylePicker({ selected, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{t('carousel.imageStyle')}</label>
      <div id="carousel-style-picker-089" className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {STYLES.map((s) => (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            style={{ background: s.bg }}
            className={`relative flex items-center justify-center px-2 py-3 rounded-lg border-2 transition-all text-center ${
              selected === s.id
                ? 'border-primary ring-2 ring-primary/30 scale-[1.03]'
                : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <span
              className="text-xs font-bold drop-shadow-md"
              style={{ color: s.id === 'minimalist' ? '#374151' : '#ffffff' }}
            >
              {t(`carousel.style_${s.id}`)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
