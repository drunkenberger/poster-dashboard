import type { PaginatedResponse, Platform, SocialAccount } from '../../../shared/types/index.ts';
import api from './api.ts';

interface AccountFilters {
  platform?: Platform;
  username?: string;
  limit?: number;
  offset?: number;
}

export const accountsService = {
  async getAll(filters?: AccountFilters): Promise<PaginatedResponse<SocialAccount>> {
    const { data } = await api.get('/accounts', { params: filters });
    return data;
  },

  async getById(id: number): Promise<SocialAccount> {
    const { data } = await api.get(`/accounts/${id}`);
    return data;
  },
};
