
import type { CanvasFormat, CanvasQuality } from '../types/canvas.types';

export interface CanvasConfig {
  defaultFormat?: CanvasFormat;
  defaultQuality?: CanvasQuality;
  maxDimension?: number;
  scale?: number;
  backgroundColor?: string;
  useCORS?: boolean;
}

export const DEFAULT_CANVAS_CONFIG: CanvasConfig = {
  defaultFormat: 'png',
  defaultQuality: 0.9,
  maxDimension: 4096,
  scale: 2,
  backgroundColor: '#ffffff',
  useCORS: true,
};
