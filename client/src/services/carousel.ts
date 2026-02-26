import api from './api.ts';

export interface GeneratedSlide {
  slideNumber: number;
  title: string;
  subtitle: string;
  imagePrompt: string;
}

interface GenerateTextsResponse {
  sessionId: string;
  slides: GeneratedSlide[];
}

interface GenerateImageResponse {
  imageUrl: string;
}

export const carouselService = {
  async generateTexts(
    topic: string,
    slideCount: number,
    language: 'es' | 'en',
  ): Promise<GenerateTextsResponse> {
    const { data } = await api.post('/carousel/generate-texts', { topic, slideCount, language });
    return data;
  },

  async generateSeriesTexts(
    seriesTopic: string,
    carouselCount: number,
    slidesPerCarousel: number,
    language: 'es' | 'en',
  ) {
    const { data } = await api.post('/carousel/generate-series-texts', {
      seriesTopic, carouselCount, slidesPerCarousel, language,
    });
    return data as {
      sessionId: string;
      carousels: { carouselIndex: number; subject: string; slides: GeneratedSlide[] }[];
    };
  },

  async generateSeriesImage(
    sessionId: string,
    carouselIndex: number,
    slideNumber: number,
    prompt: string,
  ): Promise<GenerateImageResponse> {
    const { data } = await api.post('/carousel/generate-image', {
      sessionId, slideNumber, prompt, carouselIndex,
    });
    return data;
  },

  async generateCaption(
    slides: { title: string; subtitle: string }[],
    language: 'es' | 'en',
    series?: { subject: string; seriesName: string; part: number; total: number },
  ): Promise<string> {
    const { data } = await api.post('/carousel/generate-caption', { slides, language, series });
    return data.caption;
  },

  async createDriveFolder(name: string, parentId: string): Promise<string> {
    const { data } = await api.post('/carousel/create-drive-folder', { name, parentId });
    return data.folderId;
  },

  async generateImage(
    sessionId: string,
    slideNumber: number,
    prompt: string,
  ): Promise<GenerateImageResponse> {
    const { data } = await api.post('/carousel/generate-image', { sessionId, slideNumber, prompt });
    return data;
  },

  async saveToDrive(
    folderId: string,
    caption: string,
    topic: string,
    slideBlobs: Blob[],
  ): Promise<{ folderId: string; folderName: string }> {
    const form = new FormData();
    form.append('folderId', folderId);
    form.append('caption', caption);
    form.append('topic', topic);
    slideBlobs.forEach((blob, i) => {
      form.append('slides', blob, `slide-${i + 1}.png`);
    });
    const { data } = await api.post('/carousel/save-to-drive', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return data;
  },

  async cleanupSession(sessionId: string): Promise<void> {
    await api.delete(`/carousel/session/${sessionId}`);
  },
};
