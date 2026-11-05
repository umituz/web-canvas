
import type { CanvasConfig } from './CanvasConfig';
import type { DeviceConfigOption } from './DeviceConfig';
import type { ScreenshotFormat, Language } from '../types/screenshot.types';

export interface ExportConfig {
  includeMetadata?: boolean;
  zipFilename?: string;
  folderStructure?: 'flat' | 'by-language' | 'by-device';
  defaultFormat?: ScreenshotFormat;
}

export interface AIConfig {
  enabled?: boolean;
  provider?: 'gemini' | 'openai' | 'anthropic';
  apiKey?: string;
}

export interface ScreenshotStudioConfig {
  canvas?: CanvasConfig;
  device?: DeviceConfigOption;
  export?: ExportConfig;
  ai?: AIConfig;
  languages?: Language[];
  defaultLanguage?: Language;
}

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
