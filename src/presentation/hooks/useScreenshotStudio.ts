/**
 * useScreenshotStudio Hook
 * React hook for screenshot studio functionality
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  ScreenshotContent,
  ScreenshotDesign,
  Language,
  DeviceType,
  LayoutStyle,
  FrameStyle,
  AppStoreMetadata,
  ScreenshotProject,
  ScreenshotFormat,
  ScreenshotTemplate,
} from '../../domain/types/screenshot.types';
import type { ScreenshotStudioConfig } from '../../domain/config/ScreenshotStudioConfig';
import { DEFAULT_SCREENSHOT_STUDIO_CONFIG } from '../../domain/config/ScreenshotStudioConfig';
import { ScreenshotStudioService } from '../../application/services/ScreenshotStudioService';

/**
 * useScreenshotStudio hook options
 */
export interface UseScreenshotStudioOptions {
  config?: Partial<ScreenshotStudioConfig>;
  onShowToast?: (title: string, description?: string) => void;
}

/**
 * useScreenshotStudio hook return
 */
export interface UseScreenshotStudioReturn {
  // State
  screens: ScreenshotContent[];
  design: ScreenshotDesign;
  currentLanguage: Language;
  selectedScreenId: string;
  activeScreen: ScreenshotContent;
  isProcessing: boolean;
  isAnalyzing: boolean;
  appMetadata: AppStoreMetadata;
  appIcon: string | null;
  projectId: string | null;

  // Design management
  updateDesign: (updates: Partial<ScreenshotDesign>) => void;
  updateActiveScreen: (updates: Partial<ScreenshotContent>) => void;
  setSelectedScreenId: (screenId: string) => void;

  // Language management
  changeLanguage: (newLanguage: Language) => void;

  // Screen management
  addScreen: () => void;
  removeScreen: (screenId: string) => void;
  duplicateScreen: (screenId: string) => void;

  // Template management
  applyTemplate: (template: ScreenshotTemplate) => void;

  // Generation
  generateDesignedScreenshot: (
    screenId: string
  ) => Promise<{ url: string; id: string } | undefined>;

  // Export
  exportAllScreensAsZip: (
    format?: ScreenshotFormat
  ) => Promise<void>;

  // AI features (if available)
  handleAIMagic?: (screenId: string) => Promise<void>;
  handleTranslate?: (
    screenId: string,
    targetLang: Language
  ) => Promise<void>;
  handleGenerateMetadata?: () => Promise<void>;

  // Project management
  setAppMetadata: (metadata: AppStoreMetadata) => void;
  setAppIcon: (icon: string | null) => void;
  setProjectId: (id: string | null) => void;
  _getProjectState: () => ScreenshotProject;
  _loadProjectState: (state: Partial<ScreenshotProject>) => void;
}

/**
 * Default screens
 */
const DEFAULT_SCREENS: ScreenshotContent[] = [
  {
    id: '1',
    title: 'APPGROWTHFACTORY *MODERN*',
    subtitle: 'Create content with AI power',
    screenshot: null,
    translations: {
      'en-US': {
        title: 'APPGROWTHFACTORY *MODERN*',
        subtitle: 'Create content with AI power',
      },
      'tr-TR': {
        title: 'APPGROWTHFACTORY *MODERN*',
        subtitle: 'Yapay zeka gücüyle içerik üret',
      },
    },
    imageFit: 'cover',
    imageZoom: 1,
    imageAnchorX: 50,
    imageAnchorY: 50,
  },
  {
    id: '2',
    title: 'CONNECT *GLOBAL*',
    subtitle: 'Post to all platforms instantly',
    screenshot: null,
    translations: {
      'en-US': {
        title: 'CONNECT *GLOBAL*',
        subtitle: 'Post to all platforms instantly',
      },
      'tr-TR': {
        title: 'BAĞLAN *KÜRESEL*',
        subtitle: 'Tüm platformlara anında gönder',
      },
    },
    imageFit: 'cover',
    imageZoom: 1,
    imageAnchorX: 50,
    imageAnchorY: 50,
  },
];

/**
 * Default design
 */
const DEFAULT_DESIGN: ScreenshotDesign = {
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
  deviceType: 'iphone-15-pro' as DeviceType,
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

/**
 * Default app metadata
 */
const DEFAULT_APP_METADATA: AppStoreMetadata = {
  appName: 'Growdo',
  subtitle: 'AI Content Generator',
  promotionalText: 'Unlock your creative potential',
  keywords: 'ai, content, marketing, automation, generator',
  description:
    'The ultimate tool for AI-powered marketing content.',
  whatsNew: 'New Design Studio integration!',
};

/**
 * useScreenshotStudio hook
 */
export function useScreenshotStudio(
  options: UseScreenshotStudioOptions = {}
): UseScreenshotStudioReturn {
  const {
    config = {},
    onShowToast = () => {},
  } = options;

  const fullConfig = {
    ...DEFAULT_SCREENSHOT_STUDIO_CONFIG,
    ...config,
  };

  const serviceRef = useRef<ScreenshotStudioService | null>(null);

  // Initialize service once
  if (!serviceRef.current) {
    serviceRef.current = new ScreenshotStudioService(fullConfig);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up service resources if needed
      if (serviceRef.current) {
        // Any cleanup logic can go here
      }
    };
  }, []);

  const [screens, setScreens] = useState<ScreenshotContent[]>(DEFAULT_SCREENS);
  const [design, setDesign] = useState<ScreenshotDesign>(DEFAULT_DESIGN);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    fullConfig.defaultLanguage || 'en-US'
  );
  const [selectedScreenId, setSelectedScreenId] = useState<string>('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [appMetadata, setAppMetadata] = useState<AppStoreMetadata>(
    DEFAULT_APP_METADATA
  );
  const [appIcon, setAppIcon] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  const activeScreen =
    screens.find((s) => s.id === selectedScreenId) || screens[0];

  const updateDesign = useCallback((updates: Partial<ScreenshotDesign>) => {
    setDesign((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateActiveScreen = useCallback(
    (updates: Partial<ScreenshotContent>) => {
      setScreens((prev) =>
        prev.map((screen) => {
          if (screen.id !== selectedScreenId) return screen;
          const updatedScreen = { ...screen, ...updates };

          if (updates.title || updates.subtitle) {
            updatedScreen.translations = {
              ...updatedScreen.translations,
              [currentLanguage]: {
                title: updatedScreen.title,
                subtitle: updatedScreen.subtitle,
              },
            };
          }
          return updatedScreen;
        })
      );
    },
    [selectedScreenId, currentLanguage]
  );

  const changeLanguage = useCallback(
    (newLanguage: Language) => {
      setCurrentLanguage(newLanguage);
      setScreens((prev) =>
        prev.map((screen) => {
          const translation =
            screen.translations[newLanguage] ||
            screen.translations['en-US'] ||
            { title: screen.title, subtitle: screen.subtitle };
          return {
            ...screen,
            title: translation.title,
            subtitle: translation.subtitle,
          };
        })
      );
      onShowToast('Language Changed', `Switched to ${newLanguage}`);
    },
    [onShowToast]
  );

  const addScreen = useCallback(() => {
    const newScreen: ScreenshotContent = {
      id: Date.now().toString(),
      title: 'NEW *POST*',
      subtitle: 'Engage your audience',
      screenshot: null,
      translations: {
        [currentLanguage]: {
          title: 'NEW *POST*',
          subtitle: 'Engage your audience',
        },
      },
      imageFit: 'cover',
      imageZoom: 1,
      imageAnchorX: 50,
      imageAnchorY: 50,
    };

    setScreens((prev) => [...prev, newScreen]);
    setSelectedScreenId(newScreen.id);
    onShowToast('Success', 'New screen added');
  }, [currentLanguage, onShowToast]);

  const removeScreen = useCallback(
    (screenId: string) => {
      if (screens.length <= 1) return;

      setScreens((prev) => {
        const newScreens = prev.filter((s) => s.id !== screenId);
        if (selectedScreenId === screenId) {
          setSelectedScreenId(newScreens[0].id);
        }
        return newScreens;
      });

      onShowToast('Info', 'Screen removed');
    },
    [screens.length, selectedScreenId, onShowToast]
  );

  const duplicateScreen = useCallback(
    (screenId: string) => {
      const screenToDuplicate = screens.find((s) => s.id === screenId);
      if (!screenToDuplicate) return;

      const newScreen: ScreenshotContent = {
        ...screenToDuplicate,
        id: Date.now().toString(),
        title: `${screenToDuplicate.title} (Copy)`,
        translations: { ...screenToDuplicate.translations },
      };

      setScreens((prev) => {
        const index = prev.findIndex((s) => s.id === screenId);
        const newScreens = [...prev];
        newScreens.splice(index + 1, 0, newScreen);
        return newScreens;
      });

      setSelectedScreenId(newScreen.id);
      onShowToast('Success', 'Screen duplicated');
    },
    [screens, onShowToast]
  );

  const applyTemplate = useCallback(
    (template: ScreenshotTemplate) => {
      setDesign((prev) => ({ ...prev, ...template.design }));
      onShowToast('Template Applied', template.name);
    },
    [onShowToast]
  );

  const generateDesignedScreenshot = useCallback(
    async (screenId: string) => {
      if (!serviceRef.current) return;

      const screen = screens.find((s) => s.id === screenId);
      if (!screen) return;

      setIsProcessing(true);
      try {
        const result = await serviceRef.current.generateDesignedScreenshot(
          screen,
          design
        );
        onShowToast('Success', 'Screenshot generated');
        return { url: result.url, id: result.id };
      } catch {
        onShowToast('Error', 'Screenshot generation failed');
      } finally {
        setIsProcessing(false);
      }
    },
    [screens, design, onShowToast]
  );

  const exportAllScreensAsZip = useCallback(
    async (format: ScreenshotFormat = 'png') => {
      if (!serviceRef.current) return;

      setIsProcessing(true);
      let url: string | null = null;

      try {
        const project: ScreenshotProject = {
          id: projectId || 'default-project',
          name: 'Export Project',
          design,
          screens,
          currentLanguage,
          selectedScreenId,
          appMetadata,
          appIcon,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const blob = await serviceRef.current.exportProjectAsZip(project);
        url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Studio_${currentLanguage}_${Date.now()}.zip`;
        link.click();

        onShowToast(
          'Success',
          `Exported ${screens.length} screens in ZIP archive.`
        );
      } catch {
        onShowToast('Error', 'ZIP export failed');
      } finally {
        setIsProcessing(false);

        // Clean up object URL after a delay
        if (url) {
          setTimeout(() => {
            try {
              URL.revokeObjectURL(url!);
            } catch (e) {
              // Ignore cleanup errors
            }
          }, 100);
        }
      }
    },
    [
      screens,
      design,
      currentLanguage,
      appMetadata,
      appIcon,
      projectId,
      selectedScreenId,
      onShowToast,
    ]
  );

  const _getProjectState = useCallback((): ScreenshotProject => {
    return {
      id: projectId || 'appgrowthfactory_main_project',
      name: 'Default Project',
      design,
      screens,
      currentLanguage,
      selectedScreenId,
      appMetadata,
      appIcon,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }, [
    design,
    screens,
    currentLanguage,
    selectedScreenId,
    appMetadata,
    appIcon,
    projectId,
  ]);

  const _loadProjectState = useCallback(
    (state: Partial<ScreenshotProject>) => {
      if (!state) return;
      if (state.screens) setScreens(state.screens);
      if (state.design) setDesign(state.design);
      if (state.currentLanguage) setCurrentLanguage(state.currentLanguage);
      if (
        state.selectedScreenId &&
        state.screens?.find((s) => s.id === state.selectedScreenId)
      ) {
        setSelectedScreenId(state.selectedScreenId);
      }
      if (state.appMetadata) setAppMetadata(state.appMetadata);
      if (state.appIcon !== undefined) setAppIcon(state.appIcon);
    },
    []
  );

  return {
    screens,
    design,
    currentLanguage,
    selectedScreenId,
    activeScreen,
    isProcessing,
    isAnalyzing,
    appMetadata,
    appIcon,
    projectId,
    updateDesign,
    updateActiveScreen,
    setSelectedScreenId,
    changeLanguage,
    applyTemplate,
    addScreen,
    removeScreen,
    duplicateScreen,
    generateDesignedScreenshot,
    exportAllScreensAsZip,
    setAppMetadata,
    setAppIcon,
    setProjectId,
    _getProjectState,
    _loadProjectState,
  };
}
