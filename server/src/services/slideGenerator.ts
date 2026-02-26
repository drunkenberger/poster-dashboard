import OpenAI from 'openai';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (client) return client;
  client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export interface SlideTextResult {
  slideNumber: number;
  title: string;
  subtitle: string;
  imagePrompt: string;
}

const SYSTEM_PROMPT = `You are an expert carousel content creator for TikTok and Instagram.
Create engaging, scroll-stopping carousel posts that people want to swipe through.

Rules:
- First slide: attention-grabbing hook (bold question, surprising fact, or provocative statement)
- Middle slides: develop key points with clear, concise text
- Last slide: call-to-action or powerful conclusion
- Each slide needs:
  - "title": main text (3-8 words, impactful, designed for large overlay on image)
  - "subtitle": one short sentence expanding the point (under 15 words)
  - "imagePrompt": vivid visual description for AI image generation (NO text in image, abstract/atmospheric, cohesive series style)
- Image prompts should describe moods, colors, textures, scenes — never include text or letters
- Keep all text SHORT — it will be overlaid on images in large font
- Respond with JSON: { "slides": [{ "slideNumber": 1, "title": "...", "subtitle": "...", "imagePrompt": "..." }] }`;

const CAPTION_PROMPT = `You are a social media copywriter who writes detailed, engaging captions for carousel posts.

Rules:
- You receive the slide titles and subtitles from a carousel
- Write a caption that EXPANDS and DEVELOPS the ideas from the slides in more detail
- The caption should add context, explain the "why", give deeper insight, or tell a story
- Structure: compelling opening line → expanded explanation → call-to-action → hashtags
- Use natural paragraph breaks for readability
- Add 2-3 emojis naturally
- End with 8-12 relevant SEO hashtags (mix popular + niche)
- Keep it under 500 characters before hashtags
- Respond with JSON: { "caption": "..." }`;

export interface SeriesContext {
  subject: string;
  seriesName: string;
  part: number;
  total: number;
}

export async function generateCarouselCaption(
  slides: { title: string; subtitle: string }[],
  language: 'es' | 'en',
  series?: SeriesContext,
): Promise<string> {
  const langLabel = language === 'es' ? 'Spanish' : 'English';
  const slidesSummary = slides
    .map((s, i) => `Slide ${i + 1}: "${s.title}" — ${s.subtitle}`)
    .join('\n');

  let userMsg = `Write a detailed caption in ${langLabel} for this carousel:\n\n${slidesSummary}`;
  if (series) {
    userMsg += `\n\nThis is Part ${series.part}/${series.total} of the series "${series.seriesName}", focused on "${series.subject}". Mention this is part of a series.`;
  }

  const res = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.8,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: CAPTION_PROMPT },
      { role: 'user', content: userMsg },
    ],
  });

  const raw = res.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(raw);
  return parsed.caption ?? '';
}

export interface SeriesCarouselResult {
  carouselIndex: number;
  subject: string;
  slides: SlideTextResult[];
}

const SERIES_PROMPT = `You are an expert carousel content creator for TikTok and Instagram.
You create SERIES of carousel posts — multiple carousels on the same theme,
each featuring a UNIQUE subject. NO subject may repeat across carousels.

Steps:
1. Brainstorm unique subjects for the given theme. Each must be completely different.
2. For each subject, create a carousel with the specified number of slides.
3. Each slide needs:
  - "title": main text (3-8 words, designed for large overlay on image)
  - "subtitle": one sentence expanding the point (under 15 words)
  - "imagePrompt": vivid visual description for AI image generation (NO text, atmospheric, cohesive style)
4. First slide = hook, middle = key points, last = CTA.

Respond with JSON:
{ "carousels": [{ "carouselIndex": 1, "subject": "...", "slides": [{ "slideNumber": 1, "title": "...", "subtitle": "...", "imagePrompt": "..." }] }] }`;

export async function generateSeriesTexts(
  seriesTopic: string,
  carouselCount: number,
  slidesPerCarousel: number,
  language: 'es' | 'en',
): Promise<SeriesCarouselResult[]> {
  const langLabel = language === 'es' ? 'Spanish' : 'English';

  const res = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.85,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SERIES_PROMPT },
      {
        role: 'user',
        content: `Create ${carouselCount} carousels of ${slidesPerCarousel} slides each about: "${seriesTopic}". Write all text in ${langLabel}. Every carousel must focus on a COMPLETELY different subject — ZERO repetition.`,
      },
    ],
  });

  const raw = res.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(raw);

  return (parsed.carousels ?? []).map((c: any, ci: number) => ({
    carouselIndex: ci + 1,
    subject: c.subject ?? `#${ci + 1}`,
    slides: (c.slides ?? []).map((s: any, si: number) => ({
      slideNumber: si + 1,
      title: s.title ?? '',
      subtitle: s.subtitle ?? '',
      imagePrompt: s.imagePrompt ?? '',
    })),
  }));
}

export async function generateSlideTexts(
  topic: string,
  slideCount: number,
  language: 'es' | 'en',
): Promise<SlideTextResult[]> {
  const langLabel = language === 'es' ? 'Spanish' : 'English';

  const res = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.8,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Create a ${slideCount}-slide carousel about: "${topic}". Write all text in ${langLabel}.`,
      },
    ],
  });

  const raw = res.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(raw);

  return (parsed.slides ?? []).map((s: any, i: number) => ({
    slideNumber: i + 1,
    title: s.title ?? '',
    subtitle: s.subtitle ?? '',
    imagePrompt: s.imagePrompt ?? '',
  }));
}
