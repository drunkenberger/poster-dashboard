import { useRef, useEffect, useState } from 'react';
import { drawSlide, loadImage } from '../../utils/canvasDraw.ts';
import type { SlideStyle } from '../../stores/carouselStore.ts';

interface SlideCanvasProps {
  imageUrl: string;
  text: string;
  subtitle: string;
  style: SlideStyle;
  maxWidth?: number;
}

export default function SlideCanvas({
  imageUrl,
  text,
  subtitle,
  style,
  maxWidth = 320,
}: SlideCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const apiBase = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    if (!imageUrl) return;
    const src = imageUrl.startsWith('/api')
      ? `${apiBase}${imageUrl.replace('/api', '')}`
      : imageUrl;

    loadImage(src)
      .then(setImage)
      .catch(() => setImage(null));
  }, [imageUrl, apiBase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawSlide(canvas, image, text, subtitle, style);
  }, [image, text, subtitle, style]);

  return (
    <canvas
      id="carousel-canvas-preview-071"
      ref={canvasRef}
      className="rounded-lg shadow-lg"
      style={{ width: maxWidth, maxWidth: '100%' }}
    />
  );
}
