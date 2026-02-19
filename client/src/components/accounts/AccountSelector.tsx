import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccountsStore } from '../../stores/accountsStore.ts';
import { useCategoriesStore } from '../../stores/categoriesStore.ts';
import type { Platform, SocialAccount } from '../../../../shared/types/index.ts';
import PlatformIcon from '../ui/PlatformIcon.tsx';
import { PLATFORM_INFO } from '../../utils/platforms.ts';

interface AccountSelectorProps {
  selected: number[];
  onChange: (ids: number[]) => void;
}

export default function AccountSelector({ selected, onChange }: AccountSelectorProps) {
  const { t } = useTranslation();
  const { accounts, fetchAccounts } = useAccountsStore();
  const { categories } = useCategoriesStore();

  useEffect(() => {
    if (accounts.length === 0) fetchAccounts();
  }, [accounts.length, fetchAccounts]);

  const grouped = useMemo(() => {
    const map = new Map<Platform, SocialAccount[]>();
    accounts.forEach((acc) => {
      const list = map.get(acc.platform) ?? [];
      list.push(acc);
      map.set(acc.platform, list);
    });
    return map;
  }, [accounts]);

  const toggleAccount = (id: number) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  };

  const togglePlatform = (platform: Platform) => {
    const platformIds = grouped.get(platform)?.map((a) => a.id) ?? [];
    const allSelected = platformIds.every((id) => selected.includes(id));
    if (allSelected) {
      onChange(selected.filter((id) => !platformIds.includes(id)));
    } else {
      onChange([...new Set([...selected, ...platformIds])]);
    }
  };

  const toggleCategory = (accountIds: number[]) => {
    const validIds = accountIds.filter((id) => accounts.some((a) => a.id === id));
    const allSelected = validIds.every((id) => selected.includes(id));
    if (allSelected) {
      onChange(selected.filter((id) => !validIds.includes(id)));
    } else {
      onChange([...new Set([...selected, ...validIds])]);
    }
  };

  const activeCats = categories.filter((c) => c.accountIds.length > 0);

  return (
    <div id="account-selector-007" className="space-y-3">
      <label className="text-sm font-medium text-foreground">{t('posts.selectAccounts')}</label>

      {activeCats.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            {t('categories.quickSelect')}
          </span>
          <div className="flex flex-wrap gap-2">
            {activeCats.map((cat) => {
              const validIds = cat.accountIds.filter((id) => accounts.some((a) => a.id === id));
              const count = validIds.filter((id) => selected.includes(id)).length;
              const allOn = validIds.length > 0 && count === validIds.length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.accountIds)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    allOn ? 'text-white' : 'hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: allOn ? cat.color : undefined,
                    border: !allOn ? `1.5px solid ${cat.color}` : undefined,
                    color: allOn ? 'white' : cat.color,
                    opacity: allOn ? 1 : 0.7,
                  }}
                >
                  {cat.name} ({count}/{validIds.length})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {[...grouped.entries()].map(([platform, accs]) => {
        const info = PLATFORM_INFO[platform];
        return (
          <div key={platform} className="space-y-1">
            <button
              type="button"
              onClick={() => togglePlatform(platform)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <PlatformIcon platform={platform} size={16} />
              <span>{info.label}</span>
              <span className="text-xs">
                ({accs.filter((a) => selected.includes(a.id)).length}/{accs.length})
              </span>
            </button>

            <div className="ml-6 space-y-1">
              {accs.map((acc) => (
                <label
                  key={acc.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                    selected.includes(acc.id)
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-muted/50 border border-transparent hover:bg-muted'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(acc.id)}
                    onChange={() => toggleAccount(acc.id)}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-sm">@{acc.username}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}

      {accounts.length === 0 && (
        <p className="text-sm text-muted-foreground">{t('accounts.noAccounts')}</p>
      )}
    </div>
  );
}
