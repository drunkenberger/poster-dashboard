import { create } from 'zustand';
import type { Post } from '../../../shared/types/index.ts';
import { postsService } from '../services/posts.ts';

interface PostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  total: number;
  fetchPosts: (filters?: Record<string, string>) => Promise<void>;
}

export const usePostsStore = create<PostsState>((set) => ({
  posts: [],
  loading: false,
  error: null,
  total: 0,

  fetchPosts: async (filters) => {
    set({ loading: true, error: null });
    try {
      const response = await postsService.getAll(filters);
      set({ posts: response.data, total: response.meta.total, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch posts';
      set({ error: message, loading: false });
    }
  },
}));
