import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Images } from 'lucide-react';
import { useCarouselStore, DEFAULT_STYLE } from '../stores/carouselStore.ts';
import { carouselService } from '../services/carousel.ts';
import TopicInput from '../components/carousel/TopicInput.tsx';
import SlideTextEditor from '../components/carousel/SlideTextEditor.tsx';
import SlideImageReview from '../components/carousel/SlideImageReview.tsx';
import SlideStyleEditor from '../components/carousel/SlideStyleEditor.tsx';
import CarouselPublish from '../components/carousel/CarouselPublish.tsx';

type Phase = 'topic' | 'texts' | 'images' | 'styles' | 'publish';

const STEPS: { key: Phase; labelKey: string }[] = [
  { key: 'topic', labelKey: 'carousel.stepTopic' },
  { key: 'texts', labelKey: 'carousel.stepTexts' },
  { key: 'images', labelKey: 'carousel.stepImages' },
  { key: 'styles', labelKey: 'carousel.stepStyles' },
  { key: 'publish', labelKey: 'carousel.stepPublish' },
];

export default function CarouselCreator() {
  const { t } = useTranslation();
  const store = useCarouselStore();
  const [phase, setPhase] = useState<Phase>('topic');
  const [generating, setGenerating] = useState(false);
  const [imgDone, setImgDone] = useState(0);
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [topic, setTopic] = useState('');
  const [imageStyle, setImageStyle] = useState('photorealistic');

  const handleGenerate = useCallback(
    async (inputTopic: string, slideCount: number, lang: 'es' | 'en', style: string) => {
      setGenerating(true);
      setLanguage(lang);
      setTopic(inputTopic);
      setImageStyle(style);
      try {
        const { sessionId, slides } = await carouselService.generateTexts(
          inputTopic, slideCount, lang,
        );
        store.setSessionId(sessionId);
        store.setSlides(
          slides.map((s, i) => ({
            id: `slide-${i + 1}`,
            slideNumber: s.slideNumber,
            text: s.title,
            subtitle: s.subtitle,
            imagePrompt: s.imagePrompt,
            imageUrl: '',
            imageLoading: false,
            style: { ...DEFAULT_STYLE },
          })),
        );
        setPhase('texts');
      } catch { /* toast is handled by interceptor */ }
      finally { setGenerating(false); }
    },
    [store],
  );

  const startImageGeneration = useCallback(async () => {
    setPhase('images');
    setImgDone(0);
    const { slides, sessionId, setSlideLoading, updateSlideImage } = useCarouselStore.getState();

    for (const slide of slides) {
      setSlideLoading(slide.slideNumber, true);
      try {
        const { imageUrl } = await carouselService.generateImage(
          sessionId, slide.slideNumber, slide.imagePrompt, imageStyle,
        );
        updateSlideImage(slide.slideNumber, imageUrl);
      } catch {
        setSlideLoading(slide.slideNumber, false);
      }
      setImgDone((prev) => prev + 1);
    }
  }, [imageStyle]);

  const handleRegenerate = useCallback(async (slideNumber: number) => {
    const { sessionId, slides, setSlideLoading, updateSlideImage } = useCarouselStore.getState();
    const slide = slides.find((s) => s.slideNumber === slideNumber);
    if (!slide) return;

    setSlideLoading(slideNumber, true);
    try {
      const { imageUrl } = await carouselService.generateImage(
        sessionId, slideNumber, slide.imagePrompt, imageStyle,
      );
      updateSlideImage(slideNumber, imageUrl);
    } catch {
      setSlideLoading(slideNumber, false);
    }
  }, [imageStyle]);

  const stepIdx = STEPS.findIndex((s) => s.key === phase);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Images size={24} /> {t('carousel.title')}
      </h2>

      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => (
          <div key={step.key} className="flex items-center flex-1">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                i <= stepIdx
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`ml-1.5 text-xs hidden sm:inline ${
                i <= stepIdx ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
            >
              {t(step.labelKey)}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 rounded ${
                  i < stepIdx ? 'bg-primary' : 'bg-border'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {phase === 'topic' && <TopicInput onGenerate={handleGenerate} generating={generating} />}
      {phase === 'texts' && (
        <SlideTextEditor onApprove={startImageGeneration} onBack={() => setPhase('topic')} />
      )}
      {phase === 'images' && (
        <SlideImageReview
          onApprove={() => setPhase('styles')}
          onBack={() => setPhase('texts')}
          onRegenerate={handleRegenerate}
          generatingCount={imgDone}
          totalCount={store.slides.length}
        />
      )}
      {phase === 'styles' && (
        <SlideStyleEditor onApprove={() => setPhase('publish')} onBack={() => setPhase('images')} />
      )}
      {phase === 'publish' && (
        <CarouselPublish onBack={() => setPhase('styles')} language={language} topic={topic} />
      )}
    </div>
  );
}
