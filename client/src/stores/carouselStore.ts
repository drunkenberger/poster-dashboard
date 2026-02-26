import { create } from 'zustand';

export type FontFamily = 'modern' | 'serif' | 'bold' | 'handwritten';
export type TextPosition = 'top' | 'center' | 'bottom';
export type TextAlign = 'left' | 'center' | 'right';

export interface SlideStyle {
  fontFamily: FontFamily;
  fontSize: number;
  fontColor: string;
  textPosition: TextPosition;
  textAlign: TextAlign;
  textShadow: boolean;
  textOutline: boolean;
  bgOverlay: boolean;
  bgOverlayColor: string;
  bgOverlayOpacity: number;
}

export interface CarouselSlide {
  id: string;
  slideNumber: number;
  text: string;
  subtitle: string;
  imagePrompt: string;
  imageUrl: string;
  imageLoading: boolean;
  style: SlideStyle;
}

export const DEFAULT_STYLE: SlideStyle = {
  fontFamily: 'modern',
  fontSize: 72,
  fontColor: '#FFFFFF',
  textPosition: 'center',
  textAlign: 'center',
  textShadow: true,
  textOutline: false,
  bgOverlay: true,
  bgOverlayColor: '#000000',
  bgOverlayOpacity: 0.3,
};

interface CarouselState {
  sessionId: string;
  slides: CarouselSlide[];
  activeSlide: number;
  globalStyle: SlideStyle;
  setSessionId: (id: string) => void;
  setSlides: (slides: CarouselSlide[]) => void;
  updateSlideText: (n: number, text: string, subtitle: string) => void;
  updateSlideImage: (n: number, imageUrl: string) => void;
  setSlideLoading: (n: number, loading: boolean) => void;
  updateSlideStyle: (n: number, style: Partial<SlideStyle>) => void;
  setGlobalStyle: (style: SlideStyle) => void;
  applyStyleToAll: () => void;
  setActiveSlide: (n: number) => void;
  reset: () => void;
}

export const useCarouselStore = create<CarouselState>((set, get) => ({
  sessionId: '',
  slides: [],
  activeSlide: 1,
  globalStyle: { ...DEFAULT_STYLE },

  setSessionId: (id) => set({ sessionId: id }),
  setSlides: (slides) => set({ slides }),

  updateSlideText: (n, text, subtitle) =>
    set((s) => ({
      slides: s.slides.map((sl) => (sl.slideNumber === n ? { ...sl, text, subtitle } : sl)),
    })),

  updateSlideImage: (n, imageUrl) =>
    set((s) => ({
      slides: s.slides.map((sl) =>
        sl.slideNumber === n ? { ...sl, imageUrl, imageLoading: false } : sl,
      ),
    })),

  setSlideLoading: (n, loading) =>
    set((s) => ({
      slides: s.slides.map((sl) => (sl.slideNumber === n ? { ...sl, imageLoading: loading } : sl)),
    })),

  updateSlideStyle: (n, style) =>
    set((s) => ({
      slides: s.slides.map((sl) =>
        sl.slideNumber === n ? { ...sl, style: { ...sl.style, ...style } } : sl,
      ),
    })),

  setGlobalStyle: (style) => set({ globalStyle: style }),

  applyStyleToAll: () => {
    const { globalStyle } = get();
    set((s) => ({
      slides: s.slides.map((sl) => ({ ...sl, style: { ...globalStyle } })),
    }));
  },

  setActiveSlide: (n) => set({ activeSlide: n }),

  reset: () =>
    set({ sessionId: '', slides: [], activeSlide: 1, globalStyle: { ...DEFAULT_STYLE } }),
}));
