import { create } from 'zustand';
import type { Post } from '../../../shared/types/index.ts';
import { postsService } from '../services/posts.ts';

const PAGE_SIZE = 25;

interface PostsState {
  posts: Post[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  currentStatus: string | null;
  fetchPosts: (status?: string | null) => Promise<void>;
  fetchMore: () => Promise<void>;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  loading: false,
  loadingMore: false,
  error: null,
  total: 0,
  hasMore: false,
  currentStatus: null,

  fetchPosts: async (status = null) => {
    set({ loading: true, error: null, currentStatus: status });
    try {
      const response = await postsService.getAll({
        status: status ?? undefined,
        limit: PAGE_SIZE,
        offset: 0,
      });
      set({
        posts: response.data,
        total: response.meta.total,
        hasMore: response.data.length < response.meta.total,
        loading: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch posts';
      set({ error: message, loading: false });
    }
  },

  fetchMore: async () => {
    const { loadingMore, hasMore, posts, currentStatus } = get();
    if (loadingMore || !hasMore) return;

    set({ loadingMore: true });
    try {
      const response = await postsService.getAll({
        status: currentStatus ?? undefined,
        limit: PAGE_SIZE,
        offset: posts.length,
      });
      const all = [...posts, ...response.data];
      set({
        posts: all,
        total: response.meta.total,
        hasMore: all.length < response.meta.total,
        loadingMore: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch posts';
      set({ error: message, loadingMore: false });
    }
  },
}));
