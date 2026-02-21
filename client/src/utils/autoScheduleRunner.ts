import type { DriveVideo, Platform, SocialAccount } from '../../../shared/types/index.ts';
import { driveService } from '../services/drive.ts';
import { captionsService } from '../services/captions.ts';
import { postsService } from '../services/posts.ts';

export interface AutoScheduleConfig {
  videos: DriveVideo[];
  accounts: SocialAccount[];
  minInterval: number;
  maxInterval: number;
  startTime: string;
}

export type SchedulePhase = 'uploading' | 'creating' | 'done';

export interface ErrorEntry {
  video: string;
  account?: string;
  message: string;
}

export interface ScheduleProgress {
  phase: SchedulePhase;
  videosUploaded: number;
  videosFailed: number;
  videosTotal: number;
  postsCreated: number;
  postsFailed: number;
  postsTotal: number;
  currentAccount?: string;
  errors: ErrorEntry[];
}

type ProgressCallback = (p: ScheduleProgress) => void;

const UPLOAD_DELAY_MS = 2000;
const POST_DELAY_MS = 800;
const MAX_RETRIES = 5;
const RETRY_BASE_MS = 5000;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function platformConfig(platform: Platform) {
  if (platform === 'instagram') return { instagram: { placement: 'reels' as const } };
  return undefined;
}

function extractErrorMessage(err: unknown): string {
  if (!err || typeof err !== 'object') return 'Unknown error';
  const ax = err as { response?: { data?: { error?: string; message?: string }; status?: number }; message?: string };
  if (ax.response?.data?.error) return `${ax.response.status}: ${ax.response.data.error}`;
  if (ax.response?.data?.message) return `${ax.response.status}: ${ax.response.data.message}`;
  if (ax.response?.status) return `HTTP ${ax.response.status}`;
  if (ax.message) return ax.message;
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
      console.warn(`[AutoSchedule] ${label} — retry ${attempt + 1}/${MAX_RETRIES} in ${wait}ms`);
      await sleep(wait);
    }
  }
  throw new Error('Unreachable');
}

export async function runAutoSchedule(
  config: AutoScheduleConfig,
  onProgress: ProgressCallback,
): Promise<ScheduleProgress> {
  const { videos, accounts, minInterval, maxInterval, startTime } = config;
  const errors: ErrorEntry[] = [];

  const state: ScheduleProgress = {
    phase: 'uploading',
    videosUploaded: 0,
    videosFailed: 0,
    videosTotal: videos.length,
    postsCreated: 0,
    postsFailed: 0,
    postsTotal: 0,
    errors,
  };
  const report = () => onProgress({ ...state, errors: [...errors] });

  // Phase 1: Upload videos with retry + delay between each
  report();
  const mediaMap = new Map<string, string>();
  const captionMap = new Map<string, string>();
  const uploadedVideos: DriveVideo[] = [];

  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    try {
      const { media_id } = await withRetry(
        () => driveService.uploadFromDrive(video.id),
        `Upload ${video.name}`,
      );
      mediaMap.set(video.id, media_id);
      uploadedVideos.push(video);
      state.videosUploaded++;

      try {
        const caption = await captionsService.generate(video.name, [...captionMap.values()]);
        captionMap.set(video.id, caption.es);
      } catch {
        captionMap.set(video.id, video.name);
      }
    } catch (err) {
      state.videosFailed++;
      errors.push({ video: video.name, message: extractErrorMessage(err) });
    }
    report();
    if (i < videos.length - 1) await sleep(UPLOAD_DELAY_MS);
  }

  // Recalculate total based on actual uploaded videos
  state.postsTotal = uploadedVideos.length * accounts.length;
  state.phase = 'creating';
  report();

  // Phase 2: Create 1 post per video per account with retry + delay
  for (const account of accounts) {
    state.currentAccount = account.username;
    const shuffled = shuffle(uploadedVideos);
    let currentTime = new Date(startTime);
    currentTime = new Date(currentTime.getTime() + randomBetween(0, minInterval) * 60 * 1000);

    for (const video of shuffled) {
      const mediaId = mediaMap.get(video.id)!;
      const caption = captionMap.get(video.id) ?? video.name;

      try {
        await withRetry(
          () => postsService.create({
            caption,
            social_accounts: [account.id],
            media: [mediaId],
            scheduled_at: currentTime.toISOString(),
            platform_configurations: platformConfig(account.platform),
          }),
          `Post @${account.username}/${video.name}`,
        );
        state.postsCreated++;
      } catch (err) {
        state.postsFailed++;
        errors.push({ video: video.name, account: account.username, message: extractErrorMessage(err) });
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
