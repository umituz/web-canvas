/**
 * Canvas Configuration
 * Canvas operation configuration
 */

import type { CanvasFormat, CanvasQuality } from '../types/canvas.types';

/**
 * Canvas configuration
 */
export interface CanvasConfig {
  /** Default export format */
  defaultFormat?: CanvasFormat;
  /** Default quality (0.0 - 1.0) */
  defaultQuality?: CanvasQuality;
  /** Maximum dimension (width or height) */
  maxDimension?: number;
  /** Scale factor for high-resolution exports */
  scale?: number;
  /** Default background color */
  backgroundColor?: string;
  /** Enable CORS for cross-origin images */
  useCORS?: boolean;
}

/**
 * Default canvas configuration
 */
export const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  defaultFormat: 'png',
  defaultQuality: 0.9,
  maxDimension: 4096,
  scale: 2,
  backgroundColor: '#ffffff',
  useCORS: true,
};
