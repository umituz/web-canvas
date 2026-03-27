/**
 * Screenshot Renderer
 * Device frame and screenshot rendering operations
 */

import type {
  CanvasDimensions,
  CanvasContextConfig,
} from '../../domain/types/canvas.types';
import type {
  DeviceType,
  ScreenshotContent,
  ScreenshotDesign,
  FrameStyle,
  LayoutStyle,
} from '../../domain/types/screenshot.types';
import { CanvasRenderer } from './CanvasRenderer';
import { PatternRenderer } from './PatternRenderer';
import { DeviceConfigService } from '../services/DeviceConfigService';

export class ScreenshotRenderer {
  private canvasRenderer: CanvasRenderer;
  private patternRenderer: PatternRenderer;
  private deviceConfigService: DeviceConfigService;
  private renderCache: Map<string, HTMLCanvasElement> = new Map();
  private readonly MAX_CACHE_SIZE = 5;

  constructor() {
    this.canvasRenderer = new CanvasRenderer();
    this.patternRenderer = new PatternRenderer();
    this.deviceConfigService = DeviceConfigService.getInstance();
  }

  /**
   * Clear render cache to free memory
   */
  public clearCache(): void {
    this.renderCache.clear();
    this.canvasRenderer.clearImageCache?.();
    this.patternRenderer.clearCache?.();
  }

  /**
   * Render device frame
   */
  public renderDeviceFrame(
    ctx: CanvasRenderingContext2D,
    dimensions: CanvasDimensions,
    deviceType: DeviceType,
    frameStyle: FrameStyle,
    frameColor: string
  ): void {
    const deviceConfig = this.deviceConfigService.getDeviceConfig(deviceType);
    if (!deviceConfig) return;

    if (frameStyle === 'none') return;

    const isPhone = this.deviceConfigService.isPhone(deviceType);
    const isTablet = this.deviceConfigService.isTablet(deviceType);

    if (!isPhone && !isTablet) return;

    const frameThickness = deviceConfig.frameThickness || 8;

    if (frameStyle === 'realistic') {
      this.renderRealisticFrame(ctx, dimensions, frameColor, frameThickness);
      if (isPhone && this.deviceConfigService.hasNotch(deviceType)) {
        this.renderNotch(ctx, dimensions);
      }
    } else if (frameStyle === 'minimal') {
      this.renderMinimalFrame(ctx, dimensions, frameColor, frameThickness);
    }
  }

  /**
   * Render realistic device frame
   */
  private renderRealisticFrame(
    ctx: CanvasRenderingContext2D,
    dimensions: CanvasDimensions,
    color: string,
    thickness: number
  ): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.strokeRect(
      thickness / 2,
      thickness / 2,
      dimensions.width - thickness,
      dimensions.height - thickness
    );
  }

  /**
   * Render minimal device frame
   */
  private renderMinimalFrame(
    ctx: CanvasRenderingContext2D,
    dimensions: CanvasDimensions,
    color: string,
    thickness: number
  ): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.strokeRect(0, 0, dimensions.width, dimensions.height);
  }

  /**
   * Render device notch
   */
  private renderNotch(
    ctx: CanvasRenderingContext2D,
    dimensions: CanvasDimensions
  ): void {
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(dimensions.width / 2, 20, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Render background - optimized
   */
  public renderBackground(
    ctx: CanvasRenderingContext2D,
    design: ScreenshotDesign,
    dimensions: CanvasDimensions
  ): void {
    // Fill background
    if (design.backgroundGradientEnd) {
      const gradient = this.canvasRenderer.createLinearGradient(
        ctx,
        0,
        0,
        dimensions.width,
        dimensions.height,
        [
          { offset: 0, color: design.backgroundColor },
          { offset: 1, color: design.backgroundGradientEnd },
        ]
      );
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = design.backgroundColor;
    }

    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Render pattern if specified (and not none)
    if (design.backgroundPattern && design.backgroundPattern !== 'none') {
      this.patternRenderer.renderPattern(
        ctx,
        design.backgroundPattern,
        dimensions
      );
    }
  }

  /**
   * Render text content
   */
  public renderTextContent(
    ctx: CanvasRenderingContext2D,
    content: ScreenshotContent,
    design: ScreenshotDesign,
    dimensions: CanvasDimensions
  ): void {
    const titleConfig: CanvasContextConfig = {
      fillStyle: design.textColor,
      font: `bold ${design.titleFontSize}px ${design.fontFamily}`,
      textAlign: design.textAlign,
    };

    const subtitleConfig: CanvasContextConfig = {
      fillStyle: design.textColor,
      font: `${design.subtitleFontSize}px ${design.fontFamily}`,
      textAlign: design.textAlign,
    };

    const titleY =
      design.layout === 'text-bottom'
        ? dimensions.height - 150
        : 100 + (design.offsetY || 0);

    this.canvasRenderer.drawText(
      ctx,
      this.formatText(content.title, design.textCase),
      dimensions.width / 2,
      titleY,
      titleConfig
    );

    const subtitleY = titleY + design.titleFontSize + (design.gap || 20);
    this.canvasRenderer.drawText(
      ctx,
      this.formatText(content.subtitle, design.textCase),
      dimensions.width / 2,
      subtitleY,
      subtitleConfig
    );
  }

  /**
   * Format text case
   */
  private formatText(
    text: string,
    textCase: 'uppercase' | 'lowercase' | 'none' = 'none'
  ): string {
    switch (textCase) {
      case 'uppercase':
        return text.toUpperCase();
      case 'lowercase':
        return text.toLowerCase();
      default:
        return text;
    }
  }

  /**
   * Render screenshot image
   */
  public async renderScreenshotImage(
    ctx: CanvasRenderingContext2D,
    imageUrl: string,
    design: ScreenshotDesign,
    dimensions: CanvasDimensions
  ): Promise<void> {
    if (!imageUrl) return;

    const deviceConfig = this.deviceConfigService.getDeviceConfig(
      design.deviceType
    );
    if (!deviceConfig) return;

    // Calculate screenshot area (inside device frame)
    const frameThickness = deviceConfig.frameThickness || 8;
    const padding = 60 + frameThickness;
    const screenshotWidth = dimensions.width - padding * 2;
    const screenshotHeight = dimensions.height - padding * 2;

    try {
      await this.canvasRenderer.drawImage(
        ctx,
        imageUrl,
        padding,
        padding,
        screenshotWidth,
        screenshotHeight
      );
    } catch (error) {
      console.error('Failed to render screenshot image:', error);
    }
  }

  /**
   * Render complete screenshot
   */
  public async renderDesignedScreenshot(
    content: ScreenshotContent,
    design: ScreenshotDesign
  ): Promise<HTMLCanvasElement> {
    const deviceConfig =
      this.deviceConfigService.getDeviceConfig(design.deviceType);
    if (!deviceConfig) {
      throw new Error(`Device config not found: ${design.deviceType}`);
    }

    const dimensions = deviceConfig.dimensions;
    const canvas = this.canvasRenderer.createCanvas(dimensions);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Render background
    this.renderBackground(ctx, design, dimensions);

    // Render screenshot image if available
    if (content.screenshot) {
      await this.renderScreenshotImage(ctx, content.screenshot, design, dimensions);
    }

    // Render text content
    this.renderTextContent(ctx, content, design, dimensions);

    // Render device frame
    this.renderDeviceFrame(
      ctx,
      dimensions,
      design.deviceType,
      design.frameStyle,
      design.deviceColor
    );

    return canvas;
  }

  /**
   * Render placeholder content
   */
  public renderPlaceholderContent(
    ctx: CanvasRenderingContext2D,
    dimensions: CanvasDimensions,
    deviceType: DeviceType
  ): void {
    // Background
    this.canvasRenderer.fillRect(ctx, 0, 0, dimensions.width, dimensions.height, '#ffffff');

    // Header area
    this.canvasRenderer.fillRect(ctx, 0, 0, dimensions.width, 60, '#f3f4f6');
    this.canvasRenderer.fillRect(
      ctx,
      0,
      dimensions.height - 80,
      dimensions.width,
      80,
      '#f3f4f6'
    );

    // Placeholder content blocks
    ctx.fillStyle = '#e5e7eb';
    for (let i = 0; i < 5; i++) {
      const y = 80 + i * 120;
      const height = Math.min(100, dimensions.height - y - 100);
      if (y < dimensions.height - 100) {
        this.canvasRenderer.fillRect(ctx, 20, y, dimensions.width - 40, height);
      }
    }

    // Device frame
    const deviceConfig = this.deviceConfigService.getDeviceConfig(deviceType);
    if (deviceConfig) {
      this.renderDeviceFrame(
        ctx,
        dimensions,
        deviceType,
        'realistic',
        '#1f2937'
      );
    }
  }
}
