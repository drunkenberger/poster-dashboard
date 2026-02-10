import { create } from 'zustand';
import type { Platform, SocialAccount } from '../../../shared/types/index.ts';
import { accountsService } from '../services/accounts.ts';

interface AccountsState {
  accounts: SocialAccount[];
  loading: boolean;
  error: string | null;
  platformFilter: Platform | null;
  fetchAccounts: () => Promise<void>;
  setPlatformFilter: (platform: Platform | null) => void;
  filteredAccounts: () => SocialAccount[];
}

export const useAccountsStore = create<AccountsState>((set, get) => ({
  accounts: [],
  loading: false,
  error: null,
  platformFilter: null,

  fetchAccounts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await accountsService.getAll();
      set({ accounts: response.data, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch accounts';
      set({ error: message, loading: false });
    }
  },

  setPlatformFilter: (platform) => set({ platformFilter: platform }),

  filteredAccounts: () => {
    const { accounts, platformFilter } = get();
    if (!platformFilter) return accounts;
    return accounts.filter((a) => a.platform === platformFilter);
  },
}));
