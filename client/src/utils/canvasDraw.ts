export const CANVAS_W = 1080;
export const CANVAS_H = 1920;

export const FONT_MAP: Record<string, string> = {
  modern: 'Helvetica, Arial, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  bold: 'Impact, "Arial Black", sans-serif',
  handwritten: '"Segoe Script", "Apple Chancery", cursive',
};

export interface DrawStyle {
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  textPosition: 'top' | 'center' | 'bottom';
  textAlign: 'left' | 'center' | 'right';
  textShadow: boolean;
  textOutline: boolean;
  bgOverlay: boolean;
  bgOverlayColor: string;
  bgOverlayOpacity: number;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lh: number,
  outline: boolean,
): number {
  const words = text.split(' ');
  let line = '';
  let cy = y;

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      if (outline) ctx.strokeText(line, x, cy);
      ctx.fillText(line, x, cy);
      line = word;
      cy += lh;
    } else {
      line = test;
    }
  }
  if (line) {
    if (outline) ctx.strokeText(line, x, cy);
    ctx.fillText(line, x, cy);
  }
  return cy + lh;
}

function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
  const ir = img.naturalWidth / img.naturalHeight;
  const cr = CANVAS_W / CANVAS_H;
  let sx = 0,
    sy = 0,
    sw = img.naturalWidth,
    sh = img.naturalHeight;

  if (ir > cr) {
    sw = img.naturalHeight * cr;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / cr;
    sy = (img.naturalHeight - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, CANVAS_W, CANVAS_H);
}

export function drawSlide(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement | null,
  text: string,
  subtitle: string,
  style: DrawStyle,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;

  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  if (image?.complete && image.naturalWidth > 0) drawImageCover(ctx, image);

  if (style.bgOverlay) {
    ctx.globalAlpha = style.bgOverlayOpacity;
    ctx.fillStyle = style.bgOverlayColor;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.globalAlpha = 1;
  }

  const font = FONT_MAP[style.fontFamily] ?? FONT_MAP.modern;
  const weight = style.fontFamily === 'bold' ? '' : 'bold ';
  ctx.font = `${weight}${style.fontSize}px ${font}`;
  ctx.textAlign = style.textAlign as CanvasTextAlign;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = style.fontColor;

  if (style.textShadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
  }
  if (style.textOutline) {
    ctx.strokeStyle = 'rgba(0,0,0,0.9)';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
  }

  const x =
    style.textAlign === 'left' ? 80 : style.textAlign === 'right' ? CANVAS_W - 80 : CANVAS_W / 2;
  const y =
    style.textPosition === 'top'
      ? CANVAS_H * 0.2
      : style.textPosition === 'bottom'
        ? CANVAS_H * 0.75
        : CANVAS_H * 0.45;
  const maxW = CANVAS_W - 160;

  const endY = wrapText(ctx, text, x, y, maxW, style.fontSize * 1.3, style.textOutline);

  if (subtitle) {
    const subSz = Math.round(style.fontSize * 0.5);
    ctx.font = `${subSz}px ${font}`;
    ctx.shadowBlur = style.textShadow ? 8 : 0;
    if (style.textOutline) ctx.lineWidth = 3;
    wrapText(ctx, subtitle, x, endY + 20, maxW, subSz * 1.4, style.textOutline);
  }

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
  });
}
