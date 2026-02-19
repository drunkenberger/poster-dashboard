import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DriveCategory } from '../../../shared/types/index.ts';
import { driveService } from '../services/drive.ts';

interface CustomFoldersState {
  folders: DriveCategory[];
  adding: boolean;
  addFolder: (folderIdOrUrl: string) => Promise<void>;
  removeFolder: (id: string) => void;
}

function parseFolderId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : trimmed;
}

export const useCustomFoldersStore = create<CustomFoldersState>()(
  persist(
    (set, get) => ({
      folders: [],
      adding: false,

      addFolder: async (folderIdOrUrl) => {
        const folderId = parseFolderId(folderIdOrUrl);
        if (!folderId) throw new Error('Invalid folder ID');
        if (get().folders.some((f) => f.id === folderId)) return;

        set({ adding: true });
        try {
          const info = await driveService.getFolderInfo(folderId);
          set((state) => ({
            folders: [...state.folders, { id: info.id, name: info.name }],
            adding: false,
          }));
        } catch {
          set({ adding: false });
          throw new Error('Invalid folder');
        }
      },

      removeFolder: (id) =>
        set((state) => ({
          folders: state.folders.filter((f) => f.id !== id),
        })),
    }),
    { name: 'custom-drive-folders' }
  )
);
