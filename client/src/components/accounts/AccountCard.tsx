import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { SocialAccount } from '../../../../shared/types/index.ts';
import { useCategoriesStore } from '../../stores/categoriesStore.ts';
import PlatformBadge from '../ui/PlatformBadge.tsx';
import PlatformIcon from '../ui/PlatformIcon.tsx';
import CategoryBadge from '../categories/CategoryBadge.tsx';
import AccountCategoryPicker from '../categories/AccountCategoryPicker.tsx';
import AccountPostStats, { type AccountStats } from './AccountPostStats.tsx';

interface AccountCardProps {
  account: SocialAccount;
  stats?: AccountStats;
}

export default function AccountCard({ account, stats }: AccountCardProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { getCategoriesForAccount, removeAccount } = useCategoriesStore();
  const assigned = getCategoriesForAccount(account.id);

  return (
    <div
      id={`account-card-${account.id}`}
      className="flex flex-col gap-2 p-4 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
          <PlatformIcon platform={account.platform} size={22} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">@{account.username}</p>
          <div className="flex flex-wrap items-center gap-1 mt-1">
            {assigned.map((cat) => (
              <CategoryBadge
                key={cat.id}
                name={cat.name}
                color={cat.color}
                onRemove={() => removeAccount(cat.id, account.id)}
              />
            ))}
          </div>
          {stats && (
            <div className="mt-1.5">
              <AccountPostStats stats={stats} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <PlatformBadge platform={account.platform} />
          <button
            type="button"
            onClick={() => setPickerOpen(!pickerOpen)}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
          >
            {pickerOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {pickerOpen && (
        <div className="pt-2 border-t border-border">
          <AccountCategoryPicker accountId={account.id} />
        </div>
      )}
    </div>
  );
}
