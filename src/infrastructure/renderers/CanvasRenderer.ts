/**
 * Canvas Renderer
 * Core canvas rendering operations
 */

import type {
  CanvasDimensions,
  CanvasContextConfig,
  CanvasExportOptions,
  CanvasResult,
} from '../../domain/types/canvas.types';
import { DEFAULT_CANVAS_CONFIG } from '../../domain/config/CanvasConfig';

export class CanvasRenderer {
  private config: typeof DEFAULT_CANVAS_CONFIG;
  private imageCache: Map<string, HTMLImageElement>;

  constructor(config = DEFAULT_CANVAS_CONFIG) {
    this.config = { ...DEFAULT_CANVAS_CONFIG, ...config };
    this.imageCache = new Map();
  }

  /**
   * Create a new canvas element
   */
  public createCanvas(dimensions: CanvasDimensions): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    return canvas;
  }

  /**
   * Get canvas 2D context
   */
  public getContext(
    canvas: HTMLCanvasElement
  ): CanvasRenderingContext2D | null {
    return canvas.getContext('2d');
  }

  /**
   * Apply context configuration
   */
  public configureContext(
    ctx: CanvasRenderingContext2D,
    config: CanvasContextConfig
  ): void {
    if (config.fillStyle !== undefined) {
      ctx.fillStyle = config.fillStyle;
    }
    if (config.strokeStyle !== undefined) {
      ctx.strokeStyle = config.strokeStyle;
    }
    if (config.lineWidth !== undefined) {
      ctx.lineWidth = config.lineWidth;
    }
    if (config.lineCap !== undefined) {
      ctx.lineCap = config.lineCap;
    }
    if (config.lineJoin !== undefined) {
      ctx.lineJoin = config.lineJoin;
    }
    if (config.globalAlpha !== undefined) {
      ctx.globalAlpha = config.globalAlpha;
    }
    if (config.font !== undefined) {
      ctx.font = config.font;
    }
    if (config.textAlign !== undefined) {
      ctx.textAlign = config.textAlign;
    }
    if (config.textBaseline !== undefined) {
      ctx.textBaseline = config.textBaseline;
    }
  }

  /**
   * Clear canvas
   */
  public clearCanvas(
    ctx: CanvasRenderingContext2D,
    dimensions: CanvasDimensions
  ): void {
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
  }

  /**
   * Fill rectangle
   */
  public fillRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color?: string
  ): void {
    if (color) {
      ctx.fillStyle = color;
    }
    ctx.fillRect(x, y, width, height);
  }

  /**
   * Stroke rectangle
   */
  public strokeRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color?: string,
    lineWidth?: number
  ): void {
    if (color) {
      ctx.strokeStyle = color;
    }
    if (lineWidth !== undefined) {
      ctx.lineWidth = lineWidth;
    }
    ctx.strokeRect(x, y, width, height);
  }

  /**
   * Draw text
   */
  public drawText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    config?: CanvasContextConfig
  ): void {
    if (config) {
      this.configureContext(ctx, config);
    }
    ctx.fillText(text, x, y);
  }

  /**
   * Draw image
   */
  public async drawImage(
    ctx: CanvasRenderingContext2D,
    imageSource: string | HTMLImageElement,
    x: number,
    y: number,
    width?: number,
    height?: number
  ): Promise<void> {
    let img: HTMLImageElement;

    if (typeof imageSource === 'string') {
      img = await this.loadImage(imageSource);
    } else {
      img = imageSource;
    }

    if (width && height) {
      ctx.drawImage(img, x, y, width, height);
    } else {
      ctx.drawImage(img, x, y);
    }
  }

  /**
   * Load image from URL with caching
   */
  private loadImage(url: string): Promise<HTMLImageElement> {
    // Check cache first
    if (this.imageCache.has(url)) {
      return Promise.resolve(this.imageCache.get(url)!);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      if (this.config.useCORS) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        // Cache the loaded image
        this.imageCache.set(url, img);
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  /**
   * Clear image cache to free memory
   */
  public clearImageCache(): void {
    this.imageCache.clear();
  }

  /**
   * Get cache size for monitoring
   */
  public getCacheSize(): number {
    return this.imageCache.size;
  }

  /**
   * Create gradient
   */
  public createLinearGradient(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    colorStops: Array<{ offset: number; color: string }>
  ): CanvasGradient {
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    colorStops.forEach(({ offset, color }) => {
      gradient.addColorStop(offset, color);
    });
    return gradient;
  }

  /**
   * Export canvas to blob
   */
  public async exportToBlob(
    canvas: HTMLCanvasElement,
    options: CanvasExportOptions = {}
  ): Promise<CanvasResult> {
    const format = options.format || this.config.defaultFormat;
    const quality = options.quality || this.config.defaultQuality;
    const scale = options.scale || this.config.scale;

    // Scale canvas if needed
    const scaledCanvas = (scale || 1) !== 1 ? this.scaleCanvas(canvas, scale || 1) : canvas;

    const mimeType = `image/${format || 'png'}`;
    const blob = await new Promise<Blob | null>((resolve) => {
      scaledCanvas.toBlob(
        (result) => resolve(result),
        mimeType,
        quality
      );
    });

    if (!blob) {
      throw new Error('Failed to export canvas to blob');
    }

    const url = URL.createObjectURL(blob);

    return {
      blob,
      url,
      dimensions: {
        width: scaledCanvas.width,
        height: scaledCanvas.height,
      },
      format: format || 'png',
      size: blob.size,
    };
  }

  /**
   * Export canvas to data URL
   */
  public exportToDataURL(
    canvas: HTMLCanvasElement,
    format?: string,
    quality?: number
  ): string {
    const mimeType = format || `image/${this.config.defaultFormat}`;
    const q = quality || this.config.defaultQuality;
    return canvas.toDataURL(mimeType, q);
  }

  /**
   * Scale canvas
   */
  private scaleCanvas(
    canvas: HTMLCanvasElement,
    scale: number
  ): HTMLCanvasElement {
    const scaled = document.createElement('canvas');
    scaled.width = canvas.width * scale;
    scaled.height = canvas.height * scale;

    const ctx = scaled.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(canvas, 0, 0, scaled.width, scaled.height);
    }

    return scaled;
  }

  /**
   * Clone canvas
   */
  public cloneCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const clone = document.createElement('canvas');
    clone.width = canvas.width;
    clone.height = canvas.height;

    const ctx = clone.getContext('2d');
    if (ctx) {
      ctx.drawImage(canvas, 0, 0);
    }

    return clone;
  }
}
