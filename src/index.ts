/**
 * @umituz/web-canvas
 * Comprehensive canvas and screenshot generation library
 */

// Domain exports
export type {
  // Canvas types
  CanvasFormat,
  CanvasQuality,
  CanvasDimensions,
  CanvasPosition,
  CanvasRect,
  CanvasColor,
  CanvasContextConfig,
  CanvasExportOptions,
  CanvasResult,
  CanvasOperation,

  // Screenshot types
  DeviceType,
  FrameStyle,
  LayoutStyle,
  BackgroundPattern,
  ScreenshotFormat,
  Language,
  DeviceDimensions,
  DeviceConfig,
  ScreenshotContent,
  ScreenshotDesign,
  ScreenshotMetadata,
  ScreenshotGenerationOptions,
  ScreenshotTemplate,
  AppStoreMetadata,
  ScreenshotProject,

  // Report types
  ReportItemType,
  ReportItem,
  ReportSummary,
  ReportData,
  ExportFormat,
  PDFExportOptions,
  ExcelExportOptions,
  CSVExportOptions,
  ReportExportResult,

  // Freehand types
  FreehandPoint,
  FreehandStroke,
  UseFreehandCanvasOptions,
} from './domain/types';

export type {
  CanvasConfig,
  DeviceConfigOption,
  ScreenshotStudioConfig,
  ExportConfig,
  AIConfig,
} from './domain/config';

export {
  DEFAULT_CANVAS_CONFIG,
} from './domain/config/CanvasConfig';

export {
  DEFAULT_DEVICE_CONFIG,
  DEVICE_DIMENSIONS,
} from './domain/config/DeviceConfig';

export {
  DEFAULT_SCREENSHOT_STUDIO_CONFIG,
} from './domain/config/ScreenshotStudioConfig';

// Infrastructure exports
export { CanvasRenderer } from './infrastructure/renderers/CanvasRenderer';
export { PatternRenderer } from './infrastructure/renderers/PatternRenderer';
export {
  ScreenshotRenderer,
} from './infrastructure/renderers/ScreenshotRenderer';
export {
  DeviceConfigService,
} from './infrastructure/services/DeviceConfigService';

// Application exports
export {
  ScreenshotStudioService,
} from './application/services/ScreenshotStudioService';
export { ReportService } from './application/services/ReportService';

// Presentation exports
export {
  useScreenshotStudio,
  type UseScreenshotStudioOptions,
  type UseScreenshotStudioReturn,
} from './presentation/hooks/useScreenshotStudio';

export {
  useCanvasExport,
  type UseCanvasExportOptions,
  type UseCanvasExportReturn,
} from './presentation/hooks/useCanvasExport';

export {
  useReportExport,
  type UseReportExportReturn,
} from './presentation/hooks/useReportExport';

export {
  useFreehandCanvas,
  type UseFreehandCanvasReturn,
} from './presentation/hooks/useFreehandCanvas';
