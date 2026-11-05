
import { useState, useCallback, useRef, useEffect } from 'react';
import type { CanvasExportOptions, CanvasResult } from '../../domain/types/canvas.types';
import type { CanvasConfig } from '../../domain/config/CanvasConfig';
import { DEFAULT_CANVAS_CONFIG } from '../../domain/config/CanvasConfig';
import { CanvasRenderer } from '../../infrastructure/renderers/CanvasRenderer';

export interface UseCanvasExportOptions {
  config?: CanvasConfig;
}

export interface UseCanvasExportReturn {
  isExporting: boolean;
  progress: number;
  error: string | null;
  exportToBlob: (
    canvas: HTMLCanvasElement,
    options?: CanvasExportOptions
  ) => Promise<CanvasResult | null>;
  exportToDataURL: (
    canvas: HTMLCanvasElement,
    format?: string,
    quality?: number
  ) => string | null;
  downloadCanvas: (
    canvas: HTMLCanvasElement,
    filename: string,
    options?: CanvasExportOptions
  ) => Promise<void>;
  cloneCanvas: (canvas: HTMLCanvasElement) => HTMLCanvasElement | null;
}

export function useCanvasExport(
  options: UseCanvasExportOptions = {}
): UseCanvasExportReturn {
  const { config = DEFAULT_CANVAS_CONFIG } = options;

  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const rendererRef = useRef<CanvasRenderer | null>(null);
  const urlCleanupRef = useRef<string[]>([]);

  if (!rendererRef.current) {
    rendererRef.current = new CanvasRenderer(config);
  }

  useEffect(() => {
    return () => {
      urlCleanupRef.current.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch {
        }
      });

      urlCleanupRef.current = [];
    };
  }, []);

  const exportToBlob = useCallback(
    async (
      canvas: HTMLCanvasElement,
      options?: CanvasExportOptions
    ): Promise<CanvasResult | null> => {
      if (!rendererRef.current) return null;

      setIsExporting(true);
      setProgress(0);
      setError(null);

      try {
        const result = await rendererRef.current.exportToBlob(canvas, options);
        setProgress(100);

        if (result?.url) {
          urlCleanupRef.current.push(result.url);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Export failed';
        setError(errorMessage);
        return null;
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const exportToDataURL = useCallback(
    (
      canvas: HTMLCanvasElement,
      format?: string,
      quality?: number
    ): string | null => {
      if (!rendererRef.current) return null;

      try {
        return rendererRef.current.exportToDataURL(canvas, format, quality);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Export failed';
        setError(errorMessage);
        return null;
      }
    },
    []
  );

  const downloadCanvas = useCallback(
    async (
      canvas: HTMLCanvasElement,
      filename: string,
      options?: CanvasExportOptions
    ): Promise<void> => {
      setIsExporting(true);
      setProgress(0);
      setError(null);

      try {
        const result = await exportToBlob(canvas, options);
        if (!result) {
          throw new Error('Export failed');
        }

        setProgress(50);

        const link = document.createElement('a');
        link.href = result.url;
        link.download = filename;
        link.click();

        setProgress(100);

        setTimeout(() => {
          URL.revokeObjectURL(result.url);
          const index = urlCleanupRef.current.indexOf(result.url);
          if (index > -1) {
            urlCleanupRef.current.splice(index, 1);
          }
        }, 100);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Download failed';
        setError(errorMessage);
      } finally {
        setIsExporting(false);
      }
    },
    [exportToBlob]
  );

  const cloneCanvas = useCallback(
    (canvas: HTMLCanvasElement): HTMLCanvasElement | null => {
      if (!rendererRef.current) return null;

      try {
        return rendererRef.current.cloneCanvas(canvas);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Clone failed';
        setError(errorMessage);
        return null;
      }
    },
    []
  );

  return {
    isExporting,
    progress,
    error,
    exportToBlob,
    exportToDataURL,
    downloadCanvas,
    cloneCanvas,
  };
}
