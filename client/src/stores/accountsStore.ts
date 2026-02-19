import { create } from 'zustand';
import type { Platform, SocialAccount } from '../../../shared/types/index.ts';
import { accountsService } from '../services/accounts.ts';
import { useCategoriesStore } from './categoriesStore.ts';

interface AccountsState {
  accounts: SocialAccount[];
  loading: boolean;
  error: string | null;
  platformFilter: Platform | null;
  categoryFilter: string | null;
  fetchAccounts: () => Promise<void>;
  setPlatformFilter: (platform: Platform | null) => void;
  setCategoryFilter: (categoryId: string | null) => void;
  filteredAccounts: () => SocialAccount[];
}

export const useAccountsStore = create<AccountsState>((set, get) => ({
  accounts: [],
  loading: false,
  error: null,
  platformFilter: null,
  categoryFilter: null,

  fetchAccounts: async () => {
    set({ loading: true, error: null });
    try {
      const accounts = await accountsService.getAllUnpaginated();
      set({ accounts, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch accounts';
      set({ error: message, loading: false });
    }
  },

  setPlatformFilter: (platform) => set({ platformFilter: platform }),
  setCategoryFilter: (categoryId) => set({ categoryFilter: categoryId }),

  filteredAccounts: () => {
    const { accounts, platformFilter, categoryFilter } = get();
    let result = accounts;

    if (platformFilter) {
      result = result.filter((a) => a.platform === platformFilter);
    }

    if (categoryFilter) {
      const category = useCategoriesStore.getState().categories.find((c) => c.id === categoryFilter);
      if (category) {
        result = result.filter((a) => category.accountIds.includes(a.id));
      }
    }

    return result;
  },
}));
