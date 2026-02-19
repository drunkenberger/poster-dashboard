import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { AccountConfiguration, SocialAccount } from '../../../../shared/types/index.ts';
import PlatformIcon from '../ui/PlatformIcon.tsx';

interface AccountOverridesProps {
  accounts: SocialAccount[];
  selectedAccountIds: number[];
  overrides: AccountConfiguration[];
  onChange: (overrides: AccountConfiguration[]) => void;
}

export default function AccountOverrides({
  accounts,
  selectedAccountIds,
  overrides,
  onChange,
}: AccountOverridesProps) {
  const { t } = useTranslation();
  const selected = accounts.filter((a) => selectedAccountIds.includes(a.id));

  if (selected.length === 0) return null;

  const updateOverride = (accountId: number, caption: string) => {
    const existing = overrides.filter((o) => o.account_id !== accountId);
    if (caption.trim()) {
      onChange([...existing, { account_id: accountId, caption }]);
    } else {
      onChange(existing);
    }
  };

  const getCaption = (accountId: number) =>
    overrides.find((o) => o.account_id === accountId)?.caption ?? '';

  return (
    <div id="account-overrides-020" className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        {t('posts.accountOverrides')}
      </label>
      <p className="text-xs text-muted-foreground">{t('posts.accountOverridesDesc')}</p>

      <div className="space-y-2">
        {selected.map((acc) => (
          <AccountOverrideRow
            key={acc.id}
            account={acc}
            caption={getCaption(acc.id)}
            onCaptionChange={(v) => updateOverride(acc.id, v)}
          />
        ))}
      </div>
    </div>
  );
}

function AccountOverrideRow({
  account,
  caption,
  onCaptionChange,
}: {
  account: SocialAccount;
  caption: string;
  onCaptionChange: (v: string) => void;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const hasOverride = caption.trim().length > 0;

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors"
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <PlatformIcon platform={account.platform} size={16} />
        <span className="text-foreground">@{account.username}</span>
        {hasOverride && (
          <span className="ml-auto text-xs text-primary font-medium">
            {t('posts.customized')}
          </span>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-3 pt-1">
          <textarea
            value={caption}
            onChange={(e) => onCaptionChange(e.target.value)}
            placeholder={t('posts.overrideCaptionPlaceholder')}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      )}
    </div>
  );
}
