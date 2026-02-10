import type { CreatePostDto, PaginatedResponse, Post, UpdatePostDto } from '../../../shared/types/index.ts';
import api from './api.ts';

interface PostFilters {
  platform?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export const postsService = {
  async getAll(filters?: PostFilters): Promise<PaginatedResponse<Post>> {
    const { data } = await api.get('/posts', { params: filters });
    return data;
  },

  async getById(id: string): Promise<Post> {
    const { data } = await api.get(`/posts/${id}`);
    return data;
  },

  async create(post: CreatePostDto): Promise<Post> {
    const { data } = await api.post('/posts', post);
    return data;
  },

  async update(id: string, post: UpdatePostDto): Promise<Post> {
    const { data } = await api.patch(`/posts/${id}`, post);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/posts/${id}`);
  },
};
