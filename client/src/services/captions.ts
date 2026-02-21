import api from './api.ts';

export interface GeneratedCaption {
  es: string;
  en: string;
  title: string;
}

export const captionsService = {
  async generate(videoName: string, existingCaptions: string[]): Promise<GeneratedCaption> {
    const { data } = await api.post('/captions/generate', { videoName, existingCaptions });
    return data;
  },
};
