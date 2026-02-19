import ffmpeg from 'fluent-ffmpeg';
import { execFile } from 'child_process';
import { randomUUID } from 'crypto';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { path as ffprobePath } from '@ffprobe-installer/ffprobe';

interface VideoScene { start: number; end: number }
interface VideoAnalysis { videoId: string; filename: string; duration: number; width: number; height: number; scenes: VideoScene[] }
interface AutoClip { id: string; start: number; end: number; duration: number }

let initialized = false;

function init() {
  if (initialized) return;
  ffmpeg.setFfmpegPath(ffmpegPath);
  ffmpeg.setFfprobePath(ffprobePath);
  initialized = true;
}

function probeVideo(filePath: string): Promise<ffmpeg.FfprobeData> {
  init();
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

function detectKeyframes(filePath: string): Promise<number[]> {
  return new Promise((resolve) => {
    const args = [
      '-select_streams', 'v',
      '-show_entries', 'packet=pts_time,flags',
      '-of', 'csv=p=0',
      filePath,
    ];

    execFile(ffprobePath, args, { timeout: 10_000, maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
      if (err || !stdout) { resolve([]); return; }

      const times: number[] = [];
      for (const line of stdout.split('\n')) {
        if (line.includes(',K')) {
          const t = parseFloat(line.split(',')[0]);
          if (!isNaN(t)) times.push(t);
        }
      }
      resolve(times);
    });
  });
}

function keyframesToScenes(timestamps: number[], duration: number): VideoScene[] {
  if (timestamps.length < 2) return buildEqualSegments(duration);

  const unique = [...new Set(timestamps)].sort((a, b) => a - b);
  const scenes: VideoScene[] = [];

  for (let i = 0; i < unique.length - 1; i++) {
    if (unique[i + 1] - unique[i] >= 2) {
      scenes.push({ start: unique[i], end: unique[i + 1] });
    }
  }
  const last = unique[unique.length - 1];
  if (duration - last >= 2) {
    scenes.push({ start: last, end: duration });
  }

  return scenes.length > 0 ? scenes : buildEqualSegments(duration);
}

function buildEqualSegments(duration: number, segLen = 30): VideoScene[] {
  const scenes: VideoScene[] = [];
  for (let t = 0; t < duration; t += segLen) {
    scenes.push({ start: t, end: Math.min(t + segLen, duration) });
  }
  return scenes;
}

export function mergeIntoClips(scenes: VideoScene[], targetSec = 30): AutoClip[] {
  if (scenes.length === 0) return [];

  const MIN_CLIP = 10;
  const clips: AutoClip[] = [];
  let clipStart = scenes[0].start;

  for (let i = 0; i < scenes.length; i++) {
    const accumulated = scenes[i].end - clipStart;
    const isLast = i === scenes.length - 1;

    if (accumulated >= targetSec || isLast) {
      if (accumulated >= MIN_CLIP) {
        const end = scenes[i].end;
        clips.push({ id: randomUUID(), start: clipStart, end, duration: end - clipStart });
      }
      clipStart = isLast ? scenes[i].end : scenes[i + 1]?.start ?? scenes[i].end;
    }
  }

  return clips;
}

export async function analyzeVideo(
  filePath: string,
  videoId: string,
  filename: string,
): Promise<VideoAnalysis> {
  const probe = await probeVideo(filePath);
  const video = probe.streams.find((s) => s.codec_type === 'video');
  const duration = probe.format.duration ?? 0;
  const width = video?.width ?? 0;
  const height = video?.height ?? 0;

  const keyframes = await detectKeyframes(filePath);
  const scenes = keyframesToScenes(keyframes, duration);

  return { videoId, filename, duration, width, height, scenes };
}

export function cutClip(
  inputPath: string,
  start: number,
  duration: number,
  outputPath: string,
): Promise<void> {
  init();
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(start)
      .setDuration(duration)
      .outputOptions(['-c', 'copy', '-avoid_negative_ts', 'make_zero', '-strict', 'experimental'])
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
}
