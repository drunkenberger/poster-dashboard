import { useTranslation } from 'react-i18next';
import type { Platform } from '../../../../shared/types/index.ts';
import { PLATFORM_INFO, PLATFORMS } from '../../utils/platforms.ts';
import PlatformIcon from '../ui/PlatformIcon.tsx';

interface PlatformFilterProps {
  selected: Platform | null;
  onChange: (platform: Platform | null) => void;
  availablePlatforms?: Platform[];
}

export default function PlatformFilter({ selected, onChange, availablePlatforms }: PlatformFilterProps) {
  const { t } = useTranslation();
  const platforms = availablePlatforms ?? PLATFORMS;

  return (
    <div id="accounts-platform-filter-005" className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selected === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-accent'
        }`}
      >
        {t('common.all')}
      </button>

      {platforms.map((platform) => (
        <button
          key={platform}
          onClick={() => onChange(platform === selected ? null : platform)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === platform
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          <PlatformIcon platform={platform} size={14} />
          {PLATFORM_INFO[platform].label}
        </button>
      ))}
    </div>
  );
}
