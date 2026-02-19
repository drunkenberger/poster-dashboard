import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedClip {
  clipId: string;
  mediaId: string;
  name: string;
  start: number;
  end: number;
  duration: number;
  captionEs: string;
  captionEn: string;
  title: string;
}

export interface ClipBatch {
  id: string;
  createdAt: string;
  sourceFilename: string;
  clips: SavedClip[];
}

interface ShortsState {
  batches: ClipBatch[];
  addBatch: (sourceFilename: string, clips: SavedClip[]) => void;
  removeBatch: (batchId: string) => void;
  removeClip: (batchId: string, clipId: string) => void;
  clearAll: () => void;
}

export const useShortsStore = create<ShortsState>()(
  persist(
    (set) => ({
      batches: [],

      addBatch: (sourceFilename, clips) =>
        set((state) => ({
          batches: [
            {
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              sourceFilename,
              clips,
            },
            ...state.batches,
          ],
        })),

      removeBatch: (batchId) =>
        set((state) => ({
          batches: state.batches.filter((b) => b.id !== batchId),
        })),

      removeClip: (batchId, clipId) =>
        set((state) => ({
          batches: state.batches
            .map((b) =>
              b.id === batchId
                ? { ...b, clips: b.clips.filter((c) => c.clipId !== clipId) }
                : b
            )
            .filter((b) => b.clips.length > 0),
        })),

      clearAll: () => set({ batches: [] }),
    }),
    { name: 'shorts-clips' }
  )
);
