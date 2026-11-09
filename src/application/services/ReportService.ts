
import type { ReportData } from '../../domain/types/report.types';
import type { PDFExportOptions, ExcelExportOptions } from '../../domain/types/report.types';
import { writeXlsxBlob } from '../../infrastructure/services/minimalXlsx';
import type { XlsxSheet } from '../../infrastructure/services/minimalXlsx';

function recordsToSheet(
  name: string,
  records: Record<string, string | number | boolean | null | undefined>[]
): XlsxSheet {
  const headers = [...new Set(records.flatMap((record) => Object.keys(record)))];
  return {
    name,
    rows: [headers, ...records.map((record) => headers.map((header) => record[header]))],
  };
}

export class ReportService {
  private static instance: ReportService;

  public static getInstance(): ReportService {
    if (!ReportService.instance) {
      ReportService.instance = new ReportService();
    }
    return ReportService.instance;
  }

  async exportToPDF(
    elementId: string,
    options: PDFExportOptions = {}
  ): Promise<void> {
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Report element not found');
    }

    const canvas = await html2canvas(element, {
      scale: options.scale || 2,
      useCORS: options.useCORS !== false,
      backgroundColor: options.backgroundColor || '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(options.filename || 'report.pdf');
  }

  async exportCanvasToPDF(
    canvas: HTMLCanvasElement,
    options: PDFExportOptions = {}
  ): Promise<void> {
    const jsPDF = (await import('jspdf')).default;

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(options.filename || 'canvas-export.pdf');
  }

  async exportToExcel(
    data: ReportData,
    options: ExcelExportOptions = {}
  ): Promise<void> {
    const JSZip = (await import('jszip')).default;

    const apps = data.items
      .filter((i) => i.type === 'app')
      .map((i) => ({ Name: i.name, ...i.metrics, ...i.details }));
    const campaigns = data.items
      .filter((i) => i.type === 'campaign')
      .map((i) => ({ Name: i.name, ...i.metrics, ...i.details }));
    const posts = data.items
      .filter((i) => i.type === 'post')
      .map((i) => ({ Name: i.name, ...i.metrics, ...i.details }));

    const sheets: XlsxSheet[] = [];
    if (apps.length > 0) {
      sheets.push(recordsToSheet(options.sheetName || 'Apps', apps));
    }
    if (campaigns.length > 0) {
      sheets.push(recordsToSheet('Campaigns', campaigns));
    }
    if (posts.length > 0) {
      sheets.push(recordsToSheet('Posts', posts));
    }

    if (options.includeSummary !== false) {
      const summary = [
        { Metric: 'Total Reach', Value: data.summary.totalReach },
        {
          Metric: 'Total Engagement',
          Value: data.summary.totalEngagement,
        },
        {
          Metric: 'Average Score',
          Value: data.summary.averageScore,
        },
        {
          Metric: 'Export Date',
          Value: new Date().toLocaleDateString(),
        },
      ];
      sheets.push(recordsToSheet('Summary', summary));
    }

    if (sheets.length === 0) {
      sheets.push({ name: options.sheetName || 'Sheet1', rows: [] });
    }

    const blob = await writeXlsxBlob(sheets, JSZip);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = options.filename || 'report.xlsx';
    link.click();
    URL.revokeObjectURL(url);
  }

  exportToCSV(
    data: ReportData,
    filename: string = 'report.csv',
    delimiter: ',' | ';' = ','
  ): void {
    const headers = ['Type', 'Name', 'Metrics'];
    const rows = data.items.map((item) => [
      item.type,
      item.name,
      JSON.stringify(item.metrics),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(delimiter))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  async exportMultipleToPDF(
    elementIds: string[],
    options: PDFExportOptions = {}
  ): Promise<void> {
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    const pdf = new jsPDF('p', 'mm', 'a4');

    for (let i = 0; i < elementIds.length; i++) {
      const element = document.getElementById(elementIds[i] ?? '');
      if (!element) continue;

      const canvas = await html2canvas(element, {
        scale: options.scale || 2,
        useCORS: options.useCORS !== false,
        backgroundColor: options.backgroundColor || '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    }

    pdf.save(options.filename || 'multi-page-report.pdf');
  }
}
