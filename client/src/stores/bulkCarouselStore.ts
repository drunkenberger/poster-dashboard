import { create } from 'zustand';
import type { SlideStyle } from './carouselStore.ts';
import { DEFAULT_STYLE } from './carouselStore.ts';

export interface BulkSlide {
  id: string;
  slideNumber: number;
  text: string;
  subtitle: string;
  imagePrompt: string;
  imageUrl: string;
  imageLoading: boolean;
  style: SlideStyle;
}

export interface BulkCarousel {
  carouselIndex: number;
  subject: string;
  slides: BulkSlide[];
  caption: string;
  captionLoading: boolean;
}

interface BulkCarouselState {
  sessionId: string;
  carousels: BulkCarousel[];
  activeCarousel: number;
  activeSlide: number;
  globalStyle: SlideStyle;
  setSession: (id: string, carousels: BulkCarousel[]) => void;
  updateSlideText: (ci: number, sn: number, text: string, subtitle: string) => void;
  updateSlideImage: (ci: number, sn: number, imageUrl: string) => void;
  setSlideLoading: (ci: number, sn: number, loading: boolean) => void;
  updateSlideStyle: (ci: number, sn: number, style: Partial<SlideStyle>) => void;
  setGlobalStyle: (style: SlideStyle) => void;
  applyStyleToAll: () => void;
  setCaption: (ci: number, caption: string) => void;
  setCaptionLoading: (ci: number, loading: boolean) => void;
  setActiveCarousel: (ci: number) => void;
  setActiveSlide: (sn: number) => void;
  reset: () => void;
}

function mapCarousel(c: BulkCarousel, ci: number, fn: (c: BulkCarousel) => BulkCarousel) {
  return c.carouselIndex === ci ? fn(c) : c;
}

function mapSlide(slides: BulkSlide[], sn: number, fn: (s: BulkSlide) => BulkSlide) {
  return slides.map((s) => (s.slideNumber === sn ? fn(s) : s));
}

export const useBulkCarouselStore = create<BulkCarouselState>((set, get) => ({
  sessionId: '',
  carousels: [],
  activeCarousel: 1,
  activeSlide: 1,
  globalStyle: { ...DEFAULT_STYLE },

  setSession: (id, carousels) => set({ sessionId: id, carousels, activeCarousel: 1, activeSlide: 1 }),

  updateSlideText: (ci, sn, text, subtitle) =>
    set((s) => ({
      carousels: s.carousels.map((c) =>
        mapCarousel(c, ci, (cr) => ({ ...cr, slides: mapSlide(cr.slides, sn, (sl) => ({ ...sl, text, subtitle })) })),
      ),
    })),

  updateSlideImage: (ci, sn, imageUrl) =>
    set((s) => ({
      carousels: s.carousels.map((c) =>
        mapCarousel(c, ci, (cr) => ({ ...cr, slides: mapSlide(cr.slides, sn, (sl) => ({ ...sl, imageUrl, imageLoading: false })) })),
      ),
    })),

  setSlideLoading: (ci, sn, loading) =>
    set((s) => ({
      carousels: s.carousels.map((c) =>
        mapCarousel(c, ci, (cr) => ({ ...cr, slides: mapSlide(cr.slides, sn, (sl) => ({ ...sl, imageLoading: loading })) })),
      ),
    })),

  updateSlideStyle: (ci, sn, style) =>
    set((s) => ({
      carousels: s.carousels.map((c) =>
        mapCarousel(c, ci, (cr) => ({
          ...cr,
          slides: mapSlide(cr.slides, sn, (sl) => ({ ...sl, style: { ...sl.style, ...style } })),
        })),
      ),
    })),

  setGlobalStyle: (style) => set({ globalStyle: style }),

  applyStyleToAll: () => {
    const { globalStyle } = get();
    set((s) => ({
      carousels: s.carousels.map((c) => ({
        ...c,
        slides: c.slides.map((sl) => ({ ...sl, style: { ...globalStyle } })),
      })),
    }));
  },

  setCaption: (ci, caption) =>
    set((s) => ({
      carousels: s.carousels.map((c) => mapCarousel(c, ci, (cr) => ({ ...cr, caption }))),
    })),

  setCaptionLoading: (ci, loading) =>
    set((s) => ({
      carousels: s.carousels.map((c) => mapCarousel(c, ci, (cr) => ({ ...cr, captionLoading: loading }))),
    })),

  setActiveCarousel: (ci) => set({ activeCarousel: ci, activeSlide: 1 }),
  setActiveSlide: (sn) => set({ activeSlide: sn }),

  reset: () =>
    set({ sessionId: '', carousels: [], activeCarousel: 1, activeSlide: 1, globalStyle: { ...DEFAULT_STYLE } }),
}));
