import type { Platform } from '../../../../shared/types/index.ts';
import { PLATFORM_INFO } from '../../utils/platforms.ts';
import PlatformIcon from './PlatformIcon.tsx';

interface PlatformBadgeProps {
  platform: Platform;
}

export default function PlatformBadge({ platform }: PlatformBadgeProps) {
  const info = PLATFORM_INFO[platform];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: info.bgColor, color: info.color }}
    >
      <PlatformIcon platform={platform} size={14} />
      {info.label}
    </span>
  );
}
