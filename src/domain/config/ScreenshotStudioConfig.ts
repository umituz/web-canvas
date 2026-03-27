/**
 * Screenshot Studio Configuration
 * Complete screenshot studio configuration
 */

import type { CanvasConfig } from './CanvasConfig';
import type { DeviceConfigOption } from './DeviceConfig';
import type { ScreenshotFormat, Language } from '../types/screenshot.types';

/**
 * Export configuration
 */
export interface ExportConfig {
  /** Include ASO metadata in export */
  includeMetadata?: boolean;
  /** ZIP filename template */
  zipFilename?: string;
  /** Folder structure */
  folderStructure?: 'flat' | 'by-language' | 'by-device';
  /** Default export format */
  defaultFormat?: ScreenshotFormat;
}

/**
 * AI configuration
 */
export interface AIConfig {
  /** Enable AI features */
  enabled?: boolean;
  /** AI provider */
  provider?: 'gemini' | 'openai' | 'anthropic';
  /** API key (if needed) */
  apiKey?: string;
}

/**
 * Screenshot studio configuration
 */
export interface ScreenshotStudioConfig {
  /** Canvas configuration */
  canvas?: CanvasConfig;
  /** Device configuration */
  device?: DeviceConfigOption;
  /** Export configuration */
  export?: ExportConfig;
  /** AI configuration */
  ai?: AIConfig;
  /** Supported languages */
  languages?: Language[];
  /** Default language */
  defaultLanguage?: Language;
}

/**
 * Default screenshot studio configuration
 */
export const DEFAULT_SCREENSHOT_STUDIO_CONFIG: ScreenshotStudioConfig = {
  canvas: {
    defaultFormat: 'png' as any,
    defaultQuality: 0.9,
    scale: 2,
    useCORS: true,
  },
  device: {
    devices: ['iphone-15-pro' as any],
    defaultDevice: 'iphone-15-pro' as any,
    showFrame: true,
    frameColor: '#1f2937',
    frameThickness: 8,
  },
  export: {
    includeMetadata: true,
    folderStructure: 'by-language',
    defaultFormat: 'png' as any,
  },
  ai: {
    enabled: true,
    provider: 'gemini',
  },
  languages: ['en-US', 'tr-TR', 'de-DE', 'fr-FR', 'es-ES', 'ja-JP'],
  defaultLanguage: 'en-US',
};
