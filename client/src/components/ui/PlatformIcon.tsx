import { Instagram } from 'lucide-react';
import type { Platform } from '../../../../shared/types/index.ts';
import { PLATFORM_INFO } from '../../utils/platforms.ts';

interface PlatformIconProps {
  platform: Platform;
  size?: number;
}

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.83 4.83 0 0 1-1-.15Z" />
    </svg>
  );
}

export default function PlatformIcon({ platform, size = 18 }: PlatformIconProps) {
  const info = PLATFORM_INFO[platform];
  const style = { color: info.color };

  if (platform === 'instagram') return <Instagram size={size} style={style} />;
  if (platform === 'tiktok') return <TikTokIcon size={size} />;

  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-xs font-bold text-white"
      style={{ backgroundColor: info.color, width: size, height: size, fontSize: size * 0.5 }}
    >
      {info.label[0]}
    </span>
  );
}
