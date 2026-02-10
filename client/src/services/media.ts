import type { CreateUploadUrlDto, CreateUploadUrlResponse, Media, MimeType, PaginatedResponse } from '../../../shared/types/index.ts';
import api from './api.ts';

const MIME_MAP: Record<string, MimeType> = {
  'image/png': 'image/png',
  'image/jpeg': 'image/jpeg',
  'video/mp4': 'video/mp4',
  'video/quicktime': 'video/quicktime',
};

export const mediaService = {
  async getAll(params?: { post_id?: string; type?: string }): Promise<PaginatedResponse<Media>> {
    const { data } = await api.get('/media', { params });
    return data;
  },

  async getById(id: string): Promise<Media> {
    const { data } = await api.get(`/media/${id}`);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/media/${id}`);
  },

  async createUploadUrl(dto: CreateUploadUrlDto): Promise<CreateUploadUrlResponse> {
    const { data } = await api.post('/media/upload-url', dto);
    return data;
  },

  async uploadFile(file: File): Promise<string> {
    const mimeType = MIME_MAP[file.type];
    if (!mimeType) throw new Error(`Unsupported file type: ${file.type}`);

    const { media_id, upload_url } = await this.createUploadUrl({
      name: file.name,
      mime_type: mimeType,
      size_bytes: file.size,
    });

    await fetch(upload_url, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });

    return media_id;
  },
};
