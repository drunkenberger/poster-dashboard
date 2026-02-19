import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AccountCategory } from '../../../shared/types/index.ts';

interface CategoriesState {
  categories: AccountCategory[];
  createCategory: (name: string, color: string) => void;
  updateCategory: (id: string, name: string, color: string) => void;
  deleteCategory: (id: string) => void;
  addAccount: (categoryId: string, accountId: number) => void;
  removeAccount: (categoryId: string, accountId: number) => void;
  toggleAccount: (categoryId: string, accountId: number) => void;
  getCategoriesForAccount: (accountId: number) => AccountCategory[];
}

export const CATEGORY_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#a855f7', // purple
];

export const useCategoriesStore = create<CategoriesState>()(
  persist(
    (set, get) => ({
      categories: [],

      createCategory: (name, color) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { id: crypto.randomUUID(), name, color, accountIds: [] },
          ],
        })),

      updateCategory: (id, name, color) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, name, color } : c
          ),
        })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),

      addAccount: (categoryId, accountId) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === categoryId && !c.accountIds.includes(accountId)
              ? { ...c, accountIds: [...c.accountIds, accountId] }
              : c
          ),
        })),

      removeAccount: (categoryId, accountId) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === categoryId
              ? { ...c, accountIds: c.accountIds.filter((id) => id !== accountId) }
              : c
          ),
        })),

      toggleAccount: (categoryId, accountId) => {
        const cat = get().categories.find((c) => c.id === categoryId);
        if (!cat) return;
        if (cat.accountIds.includes(accountId)) {
          get().removeAccount(categoryId, accountId);
        } else {
          get().addAccount(categoryId, accountId);
        }
      },

      getCategoriesForAccount: (accountId) =>
        get().categories.filter((c) => c.accountIds.includes(accountId)),
    }),
    { name: 'account-categories' }
  )
);
