import type { Platform } from '../../../shared/types/index.ts';

interface PlatformInfo {
  label: string;
  color: string;
  bgColor: string;
}

export const PLATFORM_INFO: Record<Platform, PlatformInfo> = {
  instagram: { label: 'Instagram', color: '#E1306C', bgColor: '#FDE8EF' },
  tiktok: { label: 'TikTok', color: '#000000', bgColor: '#E5E5E5' },
  facebook: { label: 'Facebook', color: '#1877F2', bgColor: '#E3F0FF' },
  twitter: { label: 'X / Twitter', color: '#000000', bgColor: '#E5E5E5' },
  threads: { label: 'Threads', color: '#000000', bgColor: '#E5E5E5' },
  youtube: { label: 'YouTube', color: '#FF0000', bgColor: '#FFE5E5' },
  pinterest: { label: 'Pinterest', color: '#E60023', bgColor: '#FFE5EA' },
  linkedin: { label: 'LinkedIn', color: '#0A66C2', bgColor: '#E3EEFF' },
  bluesky: { label: 'Bluesky', color: '#0085FF', bgColor: '#E5F1FF' },
};

export const PLATFORMS = Object.keys(PLATFORM_INFO) as Platform[];
