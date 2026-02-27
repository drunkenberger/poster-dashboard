import api from './api.ts';

export interface AnalyticsRecord {
  id: string;
  post_result_id: string;
  platform: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  cover_image_url: string | null;
  share_url: string | null;
  video_description: string | null;
  duration: number | null;
  platform_created_at: string | null;
  last_synced_at: string | null;
  match_confidence: string | null;
}

export interface AnalyticsResponse {
  data: AnalyticsRecord[];
  meta: { total: number; offset: number; limit: number; next: string | null };
}

export type Timeframe = '7d' | '30d' | '90d' | 'all';

interface AnalyticsFilters {
  platform?: string;
  post_result_id?: string;
  timeframe?: Timeframe;
  limit?: number;
  offset?: number;
}

export const analyticsService = {
  async getAll(filters?: AnalyticsFilters): Promise<AnalyticsResponse> {
    const { data } = await api.get('/analytics', { params: filters });
    return data;
  },

  async getById(id: string): Promise<AnalyticsRecord> {
    const { data } = await api.get(`/analytics/${id}`);
    return data;
  },

  async sync(): Promise<void> {
    await api.post('/analytics/sync');
  },
};
