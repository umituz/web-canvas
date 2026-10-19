/**
 * Freehand Types
 * Types for pointer-based freehand drawing on a canvas
 */

/**
 * A single sampled point along a stroke, in CSS pixels relative to the canvas
 */
export interface FreehandPoint {
  x: number;
  y: number;
  /** Normalized stylus pressure (0–1). ~0.5 for mouse/touch when unsupported. */
  pressure: number;
}

/**
 * A completed (or in-progress) freehand stroke
 */
export interface FreehandStroke {
  /** Base brush size in CSS pixels. */
  size: number;
  /** CSS color of the stroke. */
  color: string;
  /** True when the stroke should vary width with per-point pressure. */
  dynamic: boolean;
  /** Ordered points from pointer-down to pointer-up. */
  points: FreehandPoint[];
}

/**
 * Options for the useFreehandCanvas hook
 */
export interface UseFreehandCanvasOptions {
  /** Base brush size in CSS pixels. Default: 3 */
  brushSize?: number;
  /** Stroke color. Default: '#1a1a1a' */
  color?: string;
  /** Vary stroke width with stylus pressure (mouse/touch stay constant). Default: true */
  pressureEnabled?: boolean;
  /** Called after each completed stroke (pointer-up). */
  onStrokeEnd?: (stroke: FreehandStroke) => void;
}
