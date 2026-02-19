import type { DriveCategory, DriveVideo } from '../../../shared/types/index.ts';
import api from './api.ts';

export const driveService = {
  async getCategories(): Promise<DriveCategory[]> {
    const { data } = await api.get('/drive/categories');
    return data;
  },

  async getVideos(categoryId: string): Promise<DriveVideo[]> {
    const { data } = await api.get(`/drive/categories/${categoryId}/videos`);
    return data;
  },

  async getFolderInfo(folderId: string): Promise<{ id: string; name: string }> {
    const { data } = await api.get(`/drive/folder-info/${folderId}`);
    return data;
  },

  async uploadFromDrive(fileId: string): Promise<{ media_id: string; name: string }> {
    const { data } = await api.post('/drive/upload', { fileId });
    return data;
  },
};
