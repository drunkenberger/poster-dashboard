import OpenAI from 'openai';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (client) return client;
  client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

function buildVideoTitle(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim();
}

export interface VideoCaption {
  es: string;
  en: string;
  title: string;
}

export async function generateCaptions(
  categoryName: string,
  videoNames: string[],
): Promise<VideoCaption[]> {
  const titles = videoNames.map(buildVideoTitle);
  const empty: VideoCaption = { es: '', en: '', title: '' };

  const res = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.8,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are a viral social media copywriter for TikTok and Instagram Reels.
Your job: write short, engaging captions that maximize views, shares, and engagement.

Rules:
- For EACH video, generate:
  - "es": caption in Spanish (1-2 sentences + line break + 5-8 viral hashtags in Spanish)
  - "en": caption in English (1-2 sentences + line break + 5-8 viral hashtags in English)
  - "title": a short catchy title for TikTok (max 70 chars, in English, no hashtags)
- Match the energy of the content category: "${categoryName}"
- Use emojis naturally (2-4 per caption)
- Hashtags must be SEO-optimized, mixing high-volume and niche tags
- Never use generic filler — every word should hook the viewer
- Keep captions under 200 characters (before hashtags)

Respond with JSON: { "captions": [{ "es": "...", "en": "...", "title": "..." }, ...] }
Return exactly one object per video, in the same order.`,
      },
      {
        role: 'user',
        content: `Generate viral captions (ES + EN) and a TikTok title for each of these ${titles.length} videos:\n\n${titles.map((t, i) => `${i + 1}. ${t}`).join('\n')}`,
      },
    ],
  });

  const raw = res.choices[0]?.message?.content ?? '{}';
  try {
    const parsed = JSON.parse(raw);
    const captions: VideoCaption[] = Array.isArray(parsed.captions)
      ? parsed.captions.map((c: Record<string, string>) => ({
          es: c.es ?? '',
          en: c.en ?? '',
          title: c.title ?? '',
        }))
      : [];
    while (captions.length < videoNames.length) captions.push(empty);
    return captions.slice(0, videoNames.length);
  } catch {
    return videoNames.map(() => empty);
  }
}
