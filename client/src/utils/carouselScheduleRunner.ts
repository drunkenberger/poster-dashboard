import type { Platform, SocialAccount } from '../../../shared/types/index.ts';
import { driveService } from '../services/drive.ts';
import { postsService } from '../services/posts.ts';
import type { ScheduleProgress, ErrorEntry } from './autoScheduleRunner.ts';

export interface CarouselFolder {
  id: string;
  name: string;
  path: string;
}

export interface CarouselScheduleConfig {
  carouselFolders: CarouselFolder[];
  accounts: SocialAccount[];
  minInterval: number;
  maxInterval: number;
  startTime: string;
}

type ProgressCallback = (p: ScheduleProgress) => void;

const UPLOAD_DELAY_MS = 1500;
const POST_DELAY_MS = 800;
const MAX_RETRIES = 5;
const RETRY_BASE_MS = 5000;

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function platformConfig(platform: Platform) {
  if (platform === 'instagram') return { instagram: { placement: 'reels' as const } };
  return undefined;
}

function extractErrorMessage(err: unknown): string {
  const ax = err as { response?: { data?: { error?: string; message?: string }; status?: number }; message?: string };
  if (ax.response?.data?.error) return `${ax.response.status}: ${ax.response.data.error}`;
  if (ax.response?.data?.message) return `${ax.response.status}: ${ax.response.data.message}`;
  if (ax.response?.status) return `HTTP ${ax.response.status}`;
  if ((ax as { message?: string }).message) return (ax as { message: string }).message;
  return 'Unknown error';
}

function isRetryableError(err: unknown): boolean {
  const status = (err as { response?: { status?: number } })?.response?.status;
  return status === 429 || (status !== undefined && status >= 500);
}

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      if (!isRetryableError(err) || attempt === MAX_RETRIES - 1) throw err;
      const wait = RETRY_BASE_MS * (attempt + 1);
      console.warn(`[CarouselSchedule] ${label} — retry ${attempt + 1}/${MAX_RETRIES} in ${wait}ms`);
      await sleep(wait);
    }
  }
  throw new Error('Unreachable');
}

interface UploadedCarousel {
  name: string;
  mediaIds: string[];
  caption: string;
}

export async function runCarouselSchedule(
  config: CarouselScheduleConfig,
  onProgress: ProgressCallback,
): Promise<ScheduleProgress> {
  const { carouselFolders, accounts, minInterval, maxInterval, startTime } = config;
  const errors: ErrorEntry[] = [];

  const state: ScheduleProgress = {
    phase: 'uploading',
    videosUploaded: 0,
    videosFailed: 0,
    videosTotal: carouselFolders.length,
    postsCreated: 0,
    postsFailed: 0,
    postsTotal: 0,
    errors,
  };
  const report = () => onProgress({ ...state, errors: [...errors] });
  report();

  const uploaded: UploadedCarousel[] = [];

  for (let i = 0; i < carouselFolders.length; i++) {
    const folder = carouselFolders[i];
    try {
      const [images, caption] = await Promise.all([
        driveService.listImages(folder.id),
        driveService.getCaption(folder.id),
      ]);

      if (images.length === 0) throw new Error('No images found');

      const mediaIds: string[] = [];
      for (const img of images) {
        const { media_id } = await withRetry(
          () => driveService.uploadFromDrive(img.id),
          `Upload ${img.name} from ${folder.name}`,
        );
        mediaIds.push(media_id);
        await sleep(UPLOAD_DELAY_MS);
      }

      uploaded.push({ name: folder.name, mediaIds, caption: caption || folder.name });
      state.videosUploaded++;
    } catch (err) {
      state.videosFailed++;
      errors.push({ video: folder.name, message: extractErrorMessage(err) });
    }
    report();
  }

  state.postsTotal = uploaded.length * accounts.length;
  state.phase = 'creating';
  report();

  for (const account of accounts) {
    state.currentAccount = account.username;
    const shuffled = shuffle(uploaded);
    let currentTime = new Date(startTime);
    currentTime = new Date(currentTime.getTime() + randomBetween(0, minInterval) * 60 * 1000);

    for (const carousel of shuffled) {
      try {
        await withRetry(
          () => postsService.create({
            caption: carousel.caption,
            social_accounts: [account.id],
            media: carousel.mediaIds,
            scheduled_at: currentTime.toISOString(),
            platform_configurations: platformConfig(account.platform),
          }),
          `Post @${account.username}/${carousel.name}`,
        );
        state.postsCreated++;
      } catch (err) {
        state.postsFailed++;
        errors.push({ video: carousel.name, account: account.username, message: extractErrorMessage(err) });
      }
      report();
      await sleep(POST_DELAY_MS);
      currentTime = new Date(currentTime.getTime() + randomBetween(minInterval, maxInterval) * 60 * 1000);
    }
  }

  state.phase = 'done';
  state.currentAccount = undefined;
  report();
  return { ...state, errors: [...errors] };
}
