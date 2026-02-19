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

  async getAllUnpaginated(filters?: Omit<AccountFilters, 'limit' | 'offset'>): Promise<SocialAccount[]> {
    const limit = 50;
    let offset = 0;
    let all: SocialAccount[] = [];

    while (true) {
      const { data } = await api.get('/accounts', { params: { ...filters, limit, offset } });
      const page: PaginatedResponse<SocialAccount> = data;
      all = all.concat(page.data);
      if (!page.meta.next || all.length >= page.meta.total) break;
      offset += limit;
    }

    return all;
  },

  async getById(id: number): Promise<SocialAccount> {
    const { data } = await api.get(`/accounts/${id}`);
    return data;
  },
};
