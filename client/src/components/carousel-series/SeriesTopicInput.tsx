import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, ArrowRight } from 'lucide-react';
import ImageStylePicker, { type ImageStyleId } from '../carousel/ImageStylePicker.tsx';

interface SeriesTopicInputProps {
  onGenerate: (topic: string, count: number, slides: number, lang: 'es' | 'en', imageStyle: ImageStyleId) => void;
  generating: boolean;
}

export default function SeriesTopicInput({ onGenerate, generating }: SeriesTopicInputProps) {
  const { t } = useTranslation();
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(3);
  const [slides, setSlides] = useState(5);
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [imageStyle, setImageStyle] = useState<ImageStyleId>('photorealistic');

  const valid = topic.trim().length > 0 && !generating;

  return (
    <div className="space-y-4 p-5 rounded-xl border border-border bg-card">
      <div>
        <label htmlFor="series-topic-input-077" className="block text-sm font-medium mb-1">
          {t('bulkCarousel.topicLabel')}
        </label>
        <input
          id="series-topic-input-077"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={t('bulkCarousel.topicPlaceholder')}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="series-count-078" className="block text-xs font-medium mb-1">
            {t('bulkCarousel.carouselCount')}
          </label>
          <input
            id="series-count-078"
            type="number"
            min={2}
            max={10}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
          />
        </div>
        <div>
          <label htmlFor="series-slides-079" className="block text-xs font-medium mb-1">
            {t('bulkCarousel.slidesPerCarousel')}
          </label>
          <input
            id="series-slides-079"
            type="number"
            min={3}
            max={10}
            value={slides}
            onChange={(e) => setSlides(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">{t('carousel.language')}</label>
          <div className="flex rounded-lg overflow-hidden border border-border">
            {(['es', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`flex-1 py-2 text-xs font-medium transition-colors ${
                  lang === l ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ImageStylePicker selected={imageStyle} onChange={setImageStyle} />

      <button
        id="series-generate-btn-080"
        onClick={() => valid && onGenerate(topic.trim(), count, slides, lang, imageStyle)}
        disabled={!valid}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? (
          <><Loader2 size={16} className="animate-spin" /> {t('carousel.generating')}</>
        ) : (
          <>{t('bulkCarousel.generateAll')} <ArrowRight size={16} /></>
        )}
      </button>
    </div>
  );
}
