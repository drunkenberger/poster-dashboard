import { create } from 'zustand';
import type { DriveCategory, DriveVideo } from '../../../shared/types/index.ts';
import { driveService } from '../services/drive.ts';

interface DriveState {
  categories: DriveCategory[];
  videos: DriveVideo[];
  selectedCategory: DriveCategory | null;
  loadingCategories: boolean;
  loadingVideos: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  selectCategory: (category: DriveCategory) => Promise<void>;
  clearSelection: () => void;
}

export const useDriveStore = create<DriveState>((set) => ({
  categories: [],
  videos: [],
  selectedCategory: null,
  loadingCategories: false,
  loadingVideos: false,
  error: null,

  fetchCategories: async () => {
    set({ loadingCategories: true, error: null });
    try {
      const categories = await driveService.getCategories();
      set({ categories, loadingCategories: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch categories';
      set({ error: message, loadingCategories: false });
    }
  },

  selectCategory: async (category) => {
    set({ selectedCategory: category, loadingVideos: true, error: null, videos: [] });
    try {
      const videos = await driveService.getVideos(category.id);
      set({ videos, loadingVideos: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch videos';
      set({ error: message, loadingVideos: false });
    }
  },

  clearSelection: () => set({ selectedCategory: null, videos: [] }),
}));
