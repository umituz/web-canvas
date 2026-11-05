
export type DeviceType =
  | 'iphone-15-pro'
  | 'iphone-15'
  | 'iphone-se'
  | 'ipad-pro'
  | 'ipad'
  | 'android-phone'
  | 'android-tablet'
  | 'desktop';

export const DeviceTypeEnum = {
  IPHONE_15_PRO: 'iphone-15-pro',
  IPHONE_15: 'iphone-15',
  IPHONE_SE: 'iphone-se',
  IPAD_PRO: 'ipad-pro',
  IPAD: 'ipad',
  ANDROID_PHONE: 'android-phone',
  ANDROID_TABLET: 'android-tablet',
  DESKTOP: 'desktop',
} as const;

export type FrameStyle = 'realistic' | 'minimal' | 'none';

export const FrameStyleEnum = {
  REALISTIC: 'realistic',
  MINIMAL: 'minimal',
  NONE: 'none',
} as const;

export type LayoutStyle = 'text-top' | 'text-bottom' | 'text-overlay';

export const LayoutStyleEnum = {
  TEXT_TOP: 'text-top',
  TEXT_BOTTOM: 'text-bottom',
  TEXT_OVERLAY: 'text-overlay',
} as const;

export type BackgroundPattern =
  | 'none'
  | 'dots'
  | 'grid'
  | 'lines'
  | 'waves'
  | 'checkers';

export const BackgroundPatternEnum = {
  NONE: 'none',
  DOTS: 'dots',
  GRID: 'grid',
  LINES: 'lines',
  WAVES: 'waves',
  CHECKERS: 'checkers',
} as const;

export type ScreenshotFormat = 'png' | 'jpeg' | 'webp';

export const ScreenshotFormatEnum = {
  PNG: 'png',
  JPEG: 'jpeg',
  WEBP: 'webp',
} as const;

export type Language = string;

export interface DeviceDimensions {
  width: number;
  height: number;
  scale?: number;
}

export interface DeviceConfig {
  type: DeviceType;
  name: string;
  dimensions: DeviceDimensions;
  isPhone?: boolean;
  isTablet?: boolean;
  hasNotch?: boolean;
  cornerRadius?: number;
  frameThickness?: number;
}

export interface ScreenshotContent {
  id: string;
  title: string;
  subtitle: string;
  screenshot: string | null;
  translations: Record<Language, { title: string; subtitle: string }>;
  imageFit?: 'cover' | 'contain' | 'fill';
  imageZoom?: number;
  imageAnchorX?: number;
  imageAnchorY?: number;
}

export interface ScreenshotDesign {
  backgroundColor: string;
  backgroundGradientEnd?: string | null;
  backgroundImage?: string | null;
  backgroundBlur?: number;
  backgroundOverlayOpacity?: number;
  backgroundPattern?: BackgroundPattern;
  textColor: string;
  highlightColor: string;
  textAlign: 'left' | 'center' | 'right';
  deviceColor: string;
  deviceType: DeviceType;
  frameStyle: FrameStyle;
  layout: LayoutStyle;
  scale: number;
  fontFamily: string;
  titleFontSize: number;
  subtitleFontSize: number;
  titleFontWeight: string;
  subtitleFontWeight: string;
  textCase?: 'uppercase' | 'lowercase' | 'none';
  lineHeight?: number;
  letterSpacing?: number;
  rotation?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  offsetY?: number;
  shadowIntensity?: number;
  padding?: number;
  gap?: number;
  isPanoramic?: boolean;
}

export interface ScreenshotMetadata {
  id: string;
  deviceType: DeviceType;
  dimensions: DeviceDimensions;
  format: ScreenshotFormat;
  timestamp: Date;
  fileSize: number;
  url: string;
}

export interface ScreenshotGenerationOptions {
  deviceType: DeviceType;
  format?: ScreenshotFormat;
  quality?: number;
  customDimensions?: DeviceDimensions;
}

export interface ScreenshotTemplate {
  id: string;
  name: string;
  description: string;
  design: Partial<ScreenshotDesign>;
  thumbnail?: string;
}

export interface AppStoreMetadata {
  appName: string;
  subtitle: string;
  promotionalText: string;
  keywords: string;
  description: string;
  whatsNew: string;
}

export interface ScreenshotProject {
  id: string;
  name: string;
  design: ScreenshotDesign;
  screens: ScreenshotContent[];
  currentLanguage: Language;
  selectedScreenId: string;
  appMetadata: AppStoreMetadata;
  appIcon: string | null;
  createdAt: Date;
  updatedAt: Date;
}
