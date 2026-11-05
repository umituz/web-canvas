
export type ReportItemType = 'app' | 'campaign' | 'post';

export interface ReportItem {
  name: string;
  type: ReportItemType;
  metrics: Record<string, number | string>;
  details: Record<string, string | number | boolean | null | undefined>;
}

export interface ReportSummary {
  totalReach: number;
  totalEngagement: number;
  averageScore: number;
}

export interface ReportData {
  title: string;
  dateRange: string;
  items: ReportItem[];
  summary: ReportSummary;
}

export type ExportFormat = 'pdf' | 'excel' | 'csv';

export interface PDFExportOptions {
  filename?: string;
  scale?: number;
  useCORS?: boolean;
  backgroundColor?: string;
  format?: 'a4' | 'letter' | 'legal';
}

export interface ExcelExportOptions {
  filename?: string;
  sheetName?: string;
  includeSummary?: boolean;
}

export interface CSVExportOptions {
  filename?: string;
  delimiter?: ',' | ';';
  includeHeaders?: boolean;
}

export interface ReportExportResult {
  format: ExportFormat;
  filename: string;
  size: number;
  url: string;
  timestamp: Date;
}
