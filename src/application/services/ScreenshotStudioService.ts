
import type {
  ScreenshotContent,
  ScreenshotDesign,
  ScreenshotMetadata,
  ScreenshotGenerationOptions,
  ScreenshotProject,
  DeviceType,
  ScreenshotFormat,
} from '../../domain/types/screenshot.types';
import type { ScreenshotStudioConfig } from '../../domain/config/ScreenshotStudioConfig';
import { DEFAULT_SCREENSHOT_STUDIO_CONFIG } from '../../domain/config/ScreenshotStudioConfig';
import { ScreenshotRenderer } from '../../infrastructure/renderers/ScreenshotRenderer';

export class ScreenshotStudioService {
  private renderer: ScreenshotRenderer;
  private config: ScreenshotStudioConfig;

  constructor(config?: Partial<ScreenshotStudioConfig>) {
    this.config = {
      ...DEFAULT_SCREENSHOT_STUDIO_CONFIG,
      ...config,
    };
    this.renderer = new ScreenshotRenderer();
  }

  public async generateScreenshot(
    options: ScreenshotGenerationOptions
  ): Promise<ScreenshotMetadata> {
    const deviceConfig = this.config.device?.devices.find(
      (d) => d === options.deviceType
    );

    if (!deviceConfig) {
      throw new Error(`Device configuration not found for ${options.deviceType}`);
    }

    const canvas = this.renderer['canvasRenderer'].createCanvas(
      options.customDimensions || { width: 1290, height: 2796 }
    );
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    this.renderer['renderPlaceholderContent'](
      ctx,
      { width: canvas.width, height: canvas.height },
      options.deviceType
    );

    const blob = await this.renderer['canvasRenderer'].exportToBlob(canvas, {
      format: (options.format || this.config.export?.defaultFormat || 'png') as ScreenshotFormat,
      quality: options.quality || this.config.canvas?.defaultQuality || 0.9,
    });

    return {
      id: this.generateId(),
      deviceType: options.deviceType,
      dimensions: { width: canvas.width, height: canvas.height },
      format: options.format || this.config.export?.defaultFormat || 'png',
      timestamp: new Date(),
      fileSize: blob.blob.size,
      url: blob.url,
    };
  }

  public async generateBatchScreenshots(
    deviceTypes: DeviceType[]
  ): Promise<ScreenshotMetadata[]> {
    const BATCH_SIZE = 3;

    const results: ScreenshotMetadata[] = [];

    for (let i = 0; i < deviceTypes.length; i += BATCH_SIZE) {
      const batch = deviceTypes.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map((deviceType) =>
        this.generateScreenshot({ deviceType })
      );
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  public async generateDesignedScreenshot(
    content: ScreenshotContent,
    design: ScreenshotDesign
  ): Promise<ScreenshotMetadata> {
    const canvas = await this.renderer.renderDesignedScreenshot(content, design);
    const blob = await this.renderer['canvasRenderer'].exportToBlob(canvas, {
      format: 'png' as ScreenshotFormat,
    });

    return {
      id: this.generateId(),
      deviceType: design.deviceType,
      dimensions: { width: canvas.width, height: canvas.height },
      format: 'png',
      timestamp: new Date(),
      fileSize: blob.blob.size,
      url: blob.url,
    };
  }

  public async exportProjectAsZip(
    project: ScreenshotProject
  ): Promise<Blob> {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const folder = zip.folder(project.currentLanguage);

    if (!folder) {
      throw new Error('Failed to create folder in ZIP');
    }

    if (this.config.export?.includeMetadata) {
      const metadataText = `APP NAME: ${project.appMetadata.appName}
SUBTITLE: ${project.appMetadata.subtitle}
DESCRIPTION:
${project.appMetadata.description}

KEYWORDS: ${project.appMetadata.keywords}
WHATS NEW:
${project.appMetadata.whatsNew}`;

      folder.file('aso_metadata.txt', metadataText);
    }

    const screenshotPromises = project.screens.map((screen, index) =>
      this.generateDesignedScreenshot(screen, project.design)
        .then(screenshot => ({ screenshot, index }))
    );

    const screenshots = await Promise.all(screenshotPromises);

    screenshots.forEach(({ screenshot, index }) => {
      const base64Data = screenshot.url.split(',')[1];
      folder.file(
        `screen_${index + 1}_${project.design.deviceType}.png`,
        base64Data,
        { base64: true }
      );
    });

    return await zip.generateAsync({ type: 'blob' });
  }

  public createProject(name: string): ScreenshotProject {
    return {
      id: this.generateId(),
      name,
      design: this.getDefaultDesign(),
      screens: [this.getDefaultScreen()],
      currentLanguage: this.config.defaultLanguage || 'en-US',
      selectedScreenId: '1',
      appMetadata: {
        appName: 'My App',
        subtitle: 'App Description',
        promotionalText: 'Promotional text',
        keywords: 'keyword1, keyword2',
        description: 'App description',
        whatsNew: 'What is new in this version',
      },
      appIcon: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private getDefaultDesign(): ScreenshotDesign {
    return {
      backgroundColor: '#6366f1',
      backgroundGradientEnd: '#a855f7',
      backgroundImage: null,
      backgroundBlur: 0,
      backgroundOverlayOpacity: 0,
      backgroundPattern: 'none',
      textColor: '#ffffff',
      highlightColor: '#fbbf24',
      textAlign: 'center',
      deviceColor: '#1f2937',
      deviceType: (this.config.device?.defaultDevice || 'iphone-15-pro') as DeviceType,
      frameStyle: 'realistic',
      layout: 'text-top',
      scale: 0.85,
      fontFamily: 'Inter',
      titleFontSize: 60,
      subtitleFontSize: 24,
      titleFontWeight: '900',
      subtitleFontWeight: '500',
      textCase: 'uppercase',
      lineHeight: 0.9,
      letterSpacing: -1,
      rotation: 0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      offsetY: 0,
      shadowIntensity: 0.5,
      padding: 40,
      gap: 20,
      isPanoramic: false,
    };
  }

  private getDefaultScreen(): ScreenshotContent {
    return {
      id: '1',
      title: 'MY *APP*',
      subtitle: 'Your app description here',
      screenshot: null,
      translations: {
        'en-US': { title: 'MY *APP*', subtitle: 'Your app description here' },
      },
      imageFit: 'cover',
      imageZoom: 1,
      imageAnchorX: 50,
      imageAnchorY: 50,
    };
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
