/**
 * Canvas Types
 * Core canvas operation types
 */

/**
 * Canvas format options
 */
export type CanvasFormat = 'png' | 'jpeg' | 'webp';

/**
 * Canvas render quality
 */
export type CanvasQuality = number; // 0.0 to 1.0

/**
 * Canvas dimensions
 */
export interface CanvasDimensions {
  width: number;
  height: number;
}

/**
 * Canvas position
 */
export interface CanvasPosition {
  x: number;
  y: number;
}

/**
 * Canvas rectangle
 */
export interface CanvasRect extends CanvasPosition, CanvasDimensions {}

/**
 * Canvas color
 */
export type CanvasColor = string;

/**
 * Canvas context configuration
 */
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

/**
 * Canvas export options
 */
export interface CanvasExportOptions {
  format?: CanvasFormat;
  quality?: CanvasQuality;
  scale?: number;
  backgroundColor?: string;
  useCORS?: boolean;
}

/**
 * Canvas result
 */
export interface CanvasResult {
  blob: Blob;
  url: string;
  dimensions: CanvasDimensions;
  format: CanvasFormat;
  size: number;
}

/**
 * Canvas operation callback
 */
export type CanvasOperation<T> = (
  ctx: CanvasRenderingContext2D,
  dimensions: CanvasDimensions
) => T;
