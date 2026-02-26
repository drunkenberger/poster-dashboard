import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Sparkles } from 'lucide-react';

interface TopicInputProps {
  onGenerate: (topic: string, slideCount: number, language: 'es' | 'en') => void;
  generating: boolean;
}

export default function TopicInput({ onGenerate, generating }: TopicInputProps) {
  const { t, i18n } = useTranslation();
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [language, setLanguage] = useState<'es' | 'en'>(
    i18n.language.startsWith('es') ? 'es' : 'en',
  );

  const canGenerate = topic.trim().length > 0 && !generating;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="carousel-topic-input-061" className="text-sm font-medium text-foreground">
          {t('carousel.topicLabel')}
        </label>
        <textarea
          id="carousel-topic-input-061"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={t('carousel.topicPlaceholder')}
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="flex gap-4">
        <div className="space-y-2 flex-1">
          <label htmlFor="carousel-slide-count-062" className="text-sm font-medium text-foreground">
            {t('carousel.slideCount')}
          </label>
          <select
            id="carousel-slide-count-062"
            value={slideCount}
            onChange={(e) => setSlideCount(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>
                {n} slides
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 flex-1">
          <label
            htmlFor="carousel-lang-toggle-063"
            className="text-sm font-medium text-foreground"
          >
            {t('carousel.language')}
          </label>
          <div id="carousel-lang-toggle-063" className="flex rounded-lg border border-border overflow-hidden">
            {(['es', 'en'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                  language === lang
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:bg-muted'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        id="carousel-generate-btn-064"
        onClick={() => canGenerate && onGenerate(topic, slideCount, language)}
        disabled={!canGenerate}
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Sparkles size={16} />
        )}
        {generating ? t('carousel.generating') : t('carousel.generate')}
      </button>
    </div>
  );
}
