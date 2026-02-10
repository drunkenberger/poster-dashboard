import type { SocialAccount } from '../../../../shared/types/index.ts';
import PlatformBadge from '../ui/PlatformBadge.tsx';
import PlatformIcon from '../ui/PlatformIcon.tsx';

interface AccountCardProps {
  account: SocialAccount;
}

export default function AccountCard({ account }: AccountCardProps) {
  return (
    <div
      id={`account-card-${account.id}`}
      className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
        <PlatformIcon platform={account.platform} size={22} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">@{account.username}</p>
        <p className="text-xs text-muted-foreground">ID: {account.id}</p>
      </div>

      <PlatformBadge platform={account.platform} />
    </div>
  );
}
