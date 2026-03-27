/**
 * Report Types
 * PDF export and report generation types
 */

/**
 * Report item type
 */
export type ReportItemType = 'app' | 'campaign' | 'post';

/**
 * Report item
 */
export interface ReportItem {
  name: string;
  type: ReportItemType;
  metrics: Record<string, number | string>;
  details: Record<string, string | number | boolean | null | undefined>;
}

/**
 * Report summary
 */
export interface ReportSummary {
  totalReach: number;
  totalEngagement: number;
  averageScore: number;
}

/**
 * Report data
 */
export interface ReportData {
  title: string;
  dateRange: string;
  items: ReportItem[];
  summary: ReportSummary;
}

/**
 * Export format
 */
export type ExportFormat = 'pdf' | 'excel' | 'csv';

/**
 * PDF export options
 */
export interface PDFExportOptions {
  filename?: string;
  scale?: number;
  useCORS?: boolean;
  backgroundColor?: string;
  format?: 'a4' | 'letter' | 'legal';
}

/**
 * Excel export options
 */
export interface ExcelExportOptions {
  filename?: string;
  sheetName?: string;
  includeSummary?: boolean;
}

/**
 * CSV export options
 */
export interface CSVExportOptions {
  filename?: string;
  delimiter?: ',' | ';';
  includeHeaders?: boolean;
}

/**
 * Report export result
 */
export interface ReportExportResult {
  format: ExportFormat;
  filename: string;
  size: number;
  url: string;
  timestamp: Date;
}
