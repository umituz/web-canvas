/**
 * useReportExport Hook
 * React hook for report export operations
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ReportData } from '../../domain/types/report.types';
import type {
  PDFExportOptions,
  ExcelExportOptions,
} from '../../domain/types/report.types';
import { ReportService } from '../../application/services/ReportService';

/**
 * useReportExport hook return
 */
export interface UseReportExportReturn {
  isExporting: boolean;
  error: string | null;
  exportToPDF: (
    elementId: string,
    options?: PDFExportOptions
  ) => Promise<void>;
  exportCanvasToPDF: (
    canvas: HTMLCanvasElement,
    options?: PDFExportOptions
  ) => Promise<void>;
  exportMultipleToPDF: (
    elementIds: string[],
    options?: PDFExportOptions
  ) => Promise<void>;
  exportToExcel: (
    data: ReportData,
    options?: ExcelExportOptions
  ) => Promise<void>;
  exportToCSV: (
    data: ReportData,
    filename?: string,
    delimiter?: ',' | ';'
  ) => void;
}

/**
 * useReportExport hook
 */
export function useReportExport(): UseReportExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use ref to prevent recreating service instance on every render
  const reportServiceRef = useRef<ReportService | null>(null);

  // Initialize service once
  if (!reportServiceRef.current) {
    reportServiceRef.current = ReportService.getInstance();
  }

  const exportToPDF = useCallback(
    async (elementId: string, options?: PDFExportOptions): Promise<void> => {
      if (!reportServiceRef.current) {
        throw new Error('ReportService not initialized');
      }

      setIsExporting(true);
      setError(null);

      try {
        await reportServiceRef.current.exportToPDF(elementId, options);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'PDF export failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const exportCanvasToPDF = useCallback(
    async (
      canvas: HTMLCanvasElement,
      options?: PDFExportOptions
    ): Promise<void> => {
      if (!reportServiceRef.current) {
        throw new Error('ReportService not initialized');
      }

      setIsExporting(true);
      setError(null);

      try {
        await reportServiceRef.current.exportCanvasToPDF(canvas, options);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Canvas PDF export failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const exportMultipleToPDF = useCallback(
    async (
      elementIds: string[],
      options?: PDFExportOptions
    ): Promise<void> => {
      if (!reportServiceRef.current) {
        throw new Error('ReportService not initialized');
      }

      setIsExporting(true);
      setError(null);

      try {
        await reportServiceRef.current.exportMultipleToPDF(elementIds, options);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Multi-page PDF export failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const exportToExcel = useCallback(
    async (data: ReportData, options?: ExcelExportOptions): Promise<void> => {
      if (!reportServiceRef.current) {
        throw new Error('ReportService not initialized');
      }

      setIsExporting(true);
      setError(null);

      try {
        await reportServiceRef.current.exportToExcel(data, options);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Excel export failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const exportToCSV = useCallback(
    (
      data: ReportData,
      filename?: string,
      delimiter?: ',' | ';'
    ): void => {
      if (!reportServiceRef.current) {
        throw new Error('ReportService not initialized');
      }

      try {
        reportServiceRef.current.exportToCSV(data, filename, delimiter);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'CSV export failed';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  return {
    isExporting,
    error,
    exportToPDF,
    exportCanvasToPDF,
    exportMultipleToPDF,
    exportToExcel,
    exportToCSV,
  };
}
