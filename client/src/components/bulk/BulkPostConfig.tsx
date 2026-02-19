import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';
import AccountSelector from '../accounts/AccountSelector.tsx';
import type { BulkPostItem, PlatformConfigurations } from '../../../../shared/types/index.ts';

type AccountMode = 'shared' | 'individual';

interface BulkPostConfigProps {
  items: BulkPostItem[];
  onItemsChange: (items: BulkPostItem[]) => void;
  accountMode: AccountMode;
  onAccountModeChange: (mode: AccountMode) => void;
  sharedAccounts: number[];
  onSharedAccountsChange: (ids: number[]) => void;
  platformConfig: PlatformConfigurations;
  onPlatformConfigChange: (cfg: PlatformConfigurations) => void;
}

export default function BulkPostConfig({
  items, onItemsChange, accountMode, onAccountModeChange,
  sharedAccounts, onSharedAccountsChange, platformConfig, onPlatformConfigChange,
}: BulkPostConfigProps) {
  const { t } = useTranslation();

  const updateItem = (id: string, patch: Partial<BulkPostItem>) => {
    onItemsChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  return (
    <div id="bulk-post-config-032" className="space-y-5">
      <ModeToggle mode={accountMode} onChange={onAccountModeChange} />

      {accountMode === 'shared' && (
        <AccountSelector selected={sharedAccounts} onChange={onSharedAccountsChange} />
      )}

      <PlatformConfigSection config={platformConfig} onChange={onPlatformConfigChange} />

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">{t('bulk.postsList')}</label>
        {items.map((item) => (
          <PostItemEditor
            key={item.id}
            item={item}
            onUpdate={(patch) => updateItem(item.id, patch)}
            showAccounts={accountMode === 'individual'}
          />
        ))}
      </div>
    </div>
  );
}

function ModeToggle({ mode, onChange }: { mode: AccountMode; onChange: (m: AccountMode) => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-2">
      {(['shared', 'individual'] as const).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            mode === m ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          {t(`bulk.accountMode_${m}`)}
        </button>
      ))}
    </div>
  );
}

function PlatformConfigSection({ config, onChange }: { config: PlatformConfigurations; onChange: (c: PlatformConfigurations) => void }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{t('bulk.platformConfig')}</label>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={config.instagram?.placement === 'reels'}
            onChange={(e) => onChange({ ...config, instagram: { ...config.instagram, placement: e.target.checked ? 'reels' : 'feed' } })}
            className="w-4 h-4 accent-primary"
          />
          {t('platform.ig.reels')}
        </label>
      </div>
    </div>
  );
}

function PostItemEditor({ item, onUpdate, showAccounts }: { item: BulkPostItem; onUpdate: (patch: Partial<BulkPostItem>) => void; showAccounts: boolean }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-3">
        {item.thumbnail && <img src={item.thumbnail} alt="" className="w-10 h-10 rounded object-cover" />}
        <span className="text-sm font-medium flex-1 truncate">{item.name}</span>
        <button onClick={() => setExpanded(!expanded)} className="p-1 text-muted-foreground hover:text-foreground">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="space-y-2 pt-2">
          <textarea
            value={item.caption}
            onChange={(e) => onUpdate({ caption: e.target.value })}
            placeholder={t('posts.captionPlaceholder')}
            rows={3}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {showAccounts && (
            <AccountSelector
              selected={item.accounts ?? []}
              onChange={(ids) => onUpdate({ accounts: ids })}
            />
          )}
        </div>
      )}
    </div>
  );
}
