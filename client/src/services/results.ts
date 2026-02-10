import type { PaginatedResponse, PostResult } from '../../../shared/types/index.ts';
import api from './api.ts';

interface ResultFilters {
  post_id?: string;
  platform?: string;
  limit?: number;
  offset?: number;
}

export const resultsService = {
  async getAll(filters?: ResultFilters): Promise<PaginatedResponse<PostResult>> {
    const { data } = await api.get('/results', { params: filters });
    return data;
  },

  async getById(id: string): Promise<PostResult> {
    const { data } = await api.get(`/results/${id}`);
    return data;
  },
};
