import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Platform, PlatformConfigurations, SocialAccount } from '../../../../shared/types/index.ts';
import PlatformIcon from '../ui/PlatformIcon.tsx';
import InstagramOptions from './InstagramOptions.tsx';
import TikTokOptions from './TikTokOptions.tsx';

interface PlatformOptionsProps {
  accounts: SocialAccount[];
  selectedAccountIds: number[];
  config: PlatformConfigurations;
  onChange: (config: PlatformConfigurations) => void;
}

type Tab = 'instagram' | 'tiktok';

const SUPPORTED_TABS: { key: Tab; platform: Platform }[] = [
  { key: 'instagram', platform: 'instagram' },
  { key: 'tiktok', platform: 'tiktok' },
];

export default function PlatformOptions({
  accounts,
  selectedAccountIds,
  config,
  onChange,
}: PlatformOptionsProps) {
  const { t } = useTranslation();

  const activePlatforms = useMemo(() => {
    const selected = accounts.filter((a) => selectedAccountIds.includes(a.id));
    return new Set(selected.map((a) => a.platform));
  }, [accounts, selectedAccountIds]);

  const availableTabs = SUPPORTED_TABS.filter((tab) => activePlatforms.has(tab.platform));
  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  const currentTab = availableTabs.find((t) => t.key === activeTab) ? activeTab : availableTabs[0]?.key ?? null;

  if (availableTabs.length === 0) return null;

  return (
    <div id="platform-options-019" className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        {t('posts.platformOptions')}
      </label>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex border-b border-border">
          {availableTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                currentTab === tab.key
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <PlatformIcon platform={tab.platform} size={16} />
              {tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-4">
          {currentTab === 'instagram' && (
            <InstagramOptions
              config={config.instagram ?? {}}
              onChange={(ig) => onChange({ ...config, instagram: ig })}
            />
          )}
          {currentTab === 'tiktok' && (
            <TikTokOptions
              config={config.tiktok ?? {}}
              onChange={(tt) => onChange({ ...config, tiktok: tt })}
            />
          )}
        </div>
      </div>
    </div>
  );
}
