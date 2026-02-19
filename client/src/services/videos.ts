import api from './api.ts';
import type { VideoAnalysis } from '../../../shared/types/index.ts';

export interface AutoCutResult {
  clipId: string;
  mediaId: string;
  name: string;
  start: number;
  end: number;
  duration: number;
  captionEs: string;
  captionEn: string;
  title: string;
}

export async function uploadVideo(file: File): Promise<VideoAnalysis> {
  const form = new FormData();
  form.append('video', file);
  const { data } = await api.post<VideoAnalysis>('/videos/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300_000,
  });
  return data;
}

export async function uploadFromDrive(fileId: string): Promise<VideoAnalysis> {
  const { data } = await api.post<VideoAnalysis>('/videos/from-drive', { fileId }, {
    timeout: 300_000,
  });
  return data;
}

export function getStreamUrl(videoId: string): string {
  return `/api/videos/${videoId}/stream`;
}

export async function autoCut(videoId: string, clipDuration?: number): Promise<{ total: number; clips: AutoCutResult[] }> {
  const { data } = await api.post<{ total: number; clips: AutoCutResult[] }>(
    '/videos/auto-cut',
    { videoId, clipDuration },
    { timeout: 600_000 },
  );
  return data;
}

export async function deleteVideo(videoId: string): Promise<void> {
  await api.delete(`/videos/${videoId}`);
}
