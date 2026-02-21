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

const SYSTEM_PROMPT = `You are a viral social media copywriter for TikTok and Instagram Reels.
Your job: write short, engaging captions that maximize views, shares, and engagement.

Rules:
- Generate:
  - "es": caption in Spanish (1-2 sentences + line break + 5-8 viral hashtags in Spanish)
  - "en": caption in English (1-2 sentences + line break + 5-8 viral hashtags in English)
  - "title": a short catchy title for TikTok (max 70 chars, in English, no hashtags)
- Use emojis naturally (2-4 per caption)
- Hashtags must be SEO-optimized, mixing high-volume and niche tags
- Never use generic filler — every word should hook the viewer
- Keep captions under 200 characters (before hashtags)
- Respond with JSON: { "es": "...", "en": "...", "title": "..." }`;

export async function generateSingleCaption(
  videoName: string,
  existingCaptions: string[],
): Promise<VideoCaption> {
  const empty: VideoCaption = { es: '', en: '', title: '' };
  const title = buildVideoTitle(videoName);

  try {
    const userParts = [`Generate a unique viral caption (ES + EN) and TikTok title for this video: "${title}"`];
    if (existingCaptions.length > 0) {
      userParts.push(
        `\nIMPORTANT: These captions were already used for this same video. You MUST write something completely different — different wording, different angle, different hashtags:\n${existingCaptions.map((c, i) => `${i + 1}. ${c}`).join('\n')}`,
      );
    }

    const res = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.9,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userParts.join('') },
      ],
    });

    const raw = res.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw);
    return {
      es: parsed.es ?? '',
      en: parsed.en ?? '',
      title: parsed.title ?? '',
    };
  } catch {
    return empty;
  }
}
