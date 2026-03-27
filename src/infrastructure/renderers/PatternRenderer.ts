/**
 * Pattern Renderer
 * Background pattern rendering operations
 */

import type { CanvasDimensions } from '../../domain/types/canvas.types';
import type { BackgroundPattern } from '../../domain/types/screenshot.types';

export class PatternRenderer {
  private patternCanvasCache: Map<string, HTMLCanvasElement> = new Map();
  private readonly MAX_CACHE_SIZE = 10;

  /**
   * Render pattern on canvas
   */
  public renderPattern(
    ctx: CanvasRenderingContext2D,
    pattern: BackgroundPattern,
    dimensions: CanvasDimensions,
    color: string = '#000000'
  ): void {
    if (pattern === 'none') return;

    ctx.save();
    ctx.globalAlpha = 0.1;

    switch (pattern) {
      case 'dots':
        this.renderDotPattern(ctx, dimensions, color);
        break;
      case 'grid':
        this.renderGridPattern(ctx, dimensions, color);
        break;
      case 'lines':
        this.renderLinePattern(ctx, dimensions, color);
        break;
      case 'waves':
        this.renderWavePattern(ctx, dimensions, color);
        break;
      case 'checkers':
        this.renderCheckerPattern(ctx, dimensions, color);
        break;
    }

    ctx.restore();
  }

  /**
   * Clear pattern cache to free memory
   */
  public clearCache(): void {
    this.patternCanvasCache.clear();
  }

  /**
   * Render dot pattern - optimized with batch rendering
   */
  private renderDotPattern(
    ctx: CanvasRenderingContext2D,
    dimensions: CanvasDimensions,
    color: string
  ): void {
    ctx.fillStyle = color;
    const spacing = 30;
    const radius = 2;

    // Batch rendering for better performance
    ctx.beginPath();
    for (let x = spacing; x < dimensions.width; x += spacing) {
      for (let y = spacing; y < dimensions.height; y += spacing) {
        ctx.moveTo(x + radius, y);
        ctx.arc(x, y, radius, 0, Math.PI * 2);
      }
    }
    ctx.fill();
  }

  /**
   * Render grid pattern - optimized with single path
   */
  private renderGridPattern(
    ctx: CanvasRenderingContext2D,
    dimensions: CanvasDimensions,
    color: string
  ): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    const spacing = 30;

    ctx.beginPath();

    // Vertical lines
    for (let x = 0; x <= dimensions.width; x += spacing) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, dimensions.height);
    }

    // Horizontal lines
    for (let y = 0; y <= dimensions.height; y += spacing) {
      ctx.moveTo(0, y);
      ctx.lineTo(dimensions.width, y);
    }

    ctx.stroke();
  }

  /**
   * Render line pattern - optimized with single path
   */
  private renderLinePattern(
    ctx: CanvasRenderingContext2D,
    dimensions: CanvasDimensions,
    color: string
  ): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    const spacing = 20;

    ctx.beginPath();

    // Draw all lines in a single path
    for (let y = spacing; y < dimensions.height; y += spacing) {
      ctx.moveTo(0, y);
      ctx.lineTo(dimensions.width, y);
    }

    ctx.stroke();
  }

  /**
   * Render wave pattern - optimized with pre-calculated values
   */
  private renderWavePattern(
    ctx: CanvasRenderingContext2D,
    dimensions: CanvasDimensions,
    color: string
  ): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    const amplitude = 10;
    const frequency = 0.1;
    const spacing = 40;
    const step = 5;

    for (let y = spacing; y < dimensions.height; y += spacing) {
      ctx.beginPath();

      // Pre-calculate wave points and use more efficient path drawing
      const startX = 0;
      const startY = y + Math.sin(startX * frequency) * amplitude;
      ctx.moveTo(startX, startY);

      for (let x = step; x <= dimensions.width; x += step) {
        const waveY = y + Math.sin(x * frequency) * amplitude;
        ctx.lineTo(x, waveY);
      }

      ctx.stroke();
    }
  }

  /**
   * Render checker pattern
   */
  private renderCheckerPattern(
    ctx: CanvasRenderingContext2D,
    dimensions: CanvasDimensions,
    color: string
  ): void {
    ctx.fillStyle = color;
    const size = 20;

    for (let x = 0; x < dimensions.width; x += size * 2) {
      for (let y = 0; y < dimensions.height; y += size * 2) {
        ctx.fillRect(x, y, size, size);
        ctx.fillRect(x + size, y + size, size, size);
      }
    }
  }
}
