import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { GalleryVerticalEnd } from 'lucide-react';
import { useBulkCarouselStore } from '../stores/bulkCarouselStore.ts';
import { DEFAULT_STYLE } from '../stores/carouselStore.ts';
import { carouselService } from '../services/carousel.ts';
import SeriesTopicInput from '../components/carousel-series/SeriesTopicInput.tsx';
import SeriesTextEditor from '../components/carousel-series/SeriesTextEditor.tsx';
import SeriesImageReview from '../components/carousel-series/SeriesImageReview.tsx';
import SeriesStyleEditor from '../components/carousel-series/SeriesStyleEditor.tsx';
import SeriesPublish from '../components/carousel-series/SeriesPublish.tsx';

type Phase = 'topic' | 'texts' | 'images' | 'styles' | 'publish';

const STEPS: { key: Phase; labelKey: string }[] = [
  { key: 'topic', labelKey: 'carousel.stepTopic' },
  { key: 'texts', labelKey: 'carousel.stepTexts' },
  { key: 'images', labelKey: 'carousel.stepImages' },
  { key: 'styles', labelKey: 'carousel.stepStyles' },
  { key: 'publish', labelKey: 'carousel.stepPublish' },
];

export default function BulkCarouselCreator() {
  const { t } = useTranslation();
  const store = useBulkCarouselStore();
  const [phase, setPhase] = useState<Phase>('topic');
  const [generating, setGenerating] = useState(false);
  const [imgDone, setImgDone] = useState(0);
  const [imgTotal, setImgTotal] = useState(0);
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [topic, setTopic] = useState('');

  const handleGenerate = useCallback(
    async (inputTopic: string, count: number, slides: number, lang: 'es' | 'en') => {
      setGenerating(true);
      setLanguage(lang);
      setTopic(inputTopic);
      try {
        const { sessionId, carousels } = await carouselService.generateSeriesTexts(inputTopic, count, slides, lang);
        store.setSession(
          sessionId,
          carousels.map((c) => ({
            carouselIndex: c.carouselIndex,
            subject: c.subject,
            caption: '',
            captionLoading: false,
            slides: c.slides.map((s, i) => ({
              id: `c${c.carouselIndex}-s${i + 1}`,
              slideNumber: s.slideNumber,
              text: s.title,
              subtitle: s.subtitle,
              imagePrompt: s.imagePrompt,
              imageUrl: '',
              imageLoading: false,
              style: { ...DEFAULT_STYLE },
            })),
          })),
        );
        setPhase('texts');
      } catch { /* interceptor handles toast */ }
      finally { setGenerating(false); }
    },
    [store],
  );

  const startImageGeneration = useCallback(async () => {
    setPhase('images');
    const { carousels, sessionId, setSlideLoading, updateSlideImage } = useBulkCarouselStore.getState();
    const allSlides = carousels.flatMap((c) => c.slides.map((s) => ({ ci: c.carouselIndex, sn: s.slideNumber, prompt: s.imagePrompt })));
    setImgTotal(allSlides.length);
    setImgDone(0);

    for (const { ci, sn, prompt } of allSlides) {
      setSlideLoading(ci, sn, true);
      try {
        const { imageUrl } = await carouselService.generateSeriesImage(useBulkCarouselStore.getState().sessionId, ci, sn, prompt);
        updateSlideImage(ci, sn, imageUrl);
      } catch {
        setSlideLoading(ci, sn, false);
      }
      setImgDone((prev) => prev + 1);
    }
  }, []);

  const handleRegenerate = useCallback(async (ci: number, sn: number) => {
    const { sessionId, carousels, setSlideLoading, updateSlideImage } = useBulkCarouselStore.getState();
    const slide = carousels.find((c) => c.carouselIndex === ci)?.slides.find((s) => s.slideNumber === sn);
    if (!slide) return;

    setSlideLoading(ci, sn, true);
    try {
      const { imageUrl } = await carouselService.generateSeriesImage(sessionId, ci, sn, slide.imagePrompt);
      updateSlideImage(ci, sn, imageUrl);
    } catch {
      setSlideLoading(ci, sn, false);
    }
  }, []);

  const stepIdx = STEPS.findIndex((s) => s.key === phase);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <GalleryVerticalEnd size={24} /> {t('bulkCarousel.title')}
      </h2>

      <StepIndicator steps={STEPS} currentIdx={stepIdx} />

      {phase === 'topic' && <SeriesTopicInput onGenerate={handleGenerate} generating={generating} />}
      {phase === 'texts' && <SeriesTextEditor onApprove={startImageGeneration} onBack={() => setPhase('topic')} />}
      {phase === 'images' && (
        <SeriesImageReview
          onApprove={() => setPhase('styles')}
          onBack={() => setPhase('texts')}
          onRegenerate={handleRegenerate}
          doneCount={imgDone}
          totalCount={imgTotal}
        />
      )}
      {phase === 'styles' && <SeriesStyleEditor onApprove={() => setPhase('publish')} onBack={() => setPhase('images')} />}
      {phase === 'publish' && <SeriesPublish onBack={() => setPhase('styles')} language={language} topic={topic} />}
    </div>
  );
}

function StepIndicator({ steps, currentIdx }: { steps: typeof STEPS; currentIdx: number }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center flex-1">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${i <= currentIdx ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {i + 1}
          </div>
          <span className={`ml-1.5 text-xs hidden sm:inline ${i <= currentIdx ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
            {t(step.labelKey)}
          </span>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 rounded ${i < currentIdx ? 'bg-primary' : 'bg-border'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
