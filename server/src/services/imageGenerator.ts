import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.resolve(__dirname, '../../temp/carousel');

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (client) return client;
  client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

function getSessionDir(sessionId: string): string {
  const dir = path.join(TEMP_DIR, sessionId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export async function generateSlideImage(
  sessionId: string,
  slideNumber: number,
  prompt: string,
  carouselIndex?: number,
): Promise<string> {
  const enhancedPrompt =
    'Create a visually stunning, atmospheric background image for a social media carousel slide. ' +
    'NO text, NO letters, NO words, NO writing in the image. ' +
    prompt;

  const res = await getClient().images.generate({
    model: 'dall-e-3',
    prompt: enhancedPrompt,
    n: 1,
    size: '1024x1792',
    quality: 'standard',
    response_format: 'b64_json',
  });

  const b64 = res.data?.[0]?.b64_json;
  if (!b64) throw new Error('No image data returned');

  const dir = carouselIndex !== undefined
    ? path.join(getSessionDir(sessionId), `c${carouselIndex}`)
    : getSessionDir(sessionId);
  fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `slide-${slideNumber}.png`);
  fs.writeFileSync(filePath, Buffer.from(b64, 'base64'));

  return carouselIndex !== undefined
    ? `/api/carousel/image/${sessionId}/${carouselIndex}/${slideNumber}`
    : `/api/carousel/image/${sessionId}/${slideNumber}`;
}

export function getImagePath(
  sessionId: string,
  slideNumber: number,
  carouselIndex?: number,
): string | null {
  const dir = carouselIndex !== undefined
    ? path.join(TEMP_DIR, sessionId, `c${carouselIndex}`)
    : path.join(TEMP_DIR, sessionId);
  const filePath = path.join(dir, `slide-${slideNumber}.png`);
  return fs.existsSync(filePath) ? filePath : null;
}

export function cleanupSession(sessionId: string): void {
  const dir = path.join(TEMP_DIR, sessionId);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
