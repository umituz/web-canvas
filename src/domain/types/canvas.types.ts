
export type CanvasFormat = 'png' | 'jpeg' | 'webp';

export type CanvasQuality = number;

export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface CanvasPosition {
  x: number;
  y: number;
}

export interface CanvasRect extends CanvasPosition, CanvasDimensions {}

export type CanvasColor = string;

export interface CanvasContextConfig {
  fillStyle?: CanvasColor;
  strokeStyle?: CanvasColor;
  lineWidth?: number;
  lineCap?: 'butt' | 'round' | 'square';
  lineJoin?: 'round' | 'bevel' | 'miter';
  globalAlpha?: number;
  font?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
}

export interface CanvasExportOptions {
  format?: CanvasFormat;
  quality?: CanvasQuality;
  scale?: number;
  backgroundColor?: string;
  useCORS?: boolean;
}

export interface CanvasResult {
  blob: Blob;
  url: string;
  dimensions: CanvasDimensions;
  format: CanvasFormat;
  size: number;
}

export type CanvasOperation<T> = (
  ctx: CanvasRenderingContext2D,
  dimensions: CanvasDimensions
) => T;
