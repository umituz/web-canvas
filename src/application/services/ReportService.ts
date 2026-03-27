/**
 * Report Service
 * PDF export and report generation service
 */

import type { ReportData } from '../../domain/types/report.types';
import type { PDFExportOptions, ExcelExportOptions } from '../../domain/types/report.types';

export class ReportService {
  private static instance: ReportService;

  public static getInstance(): ReportService {
    if (!ReportService.instance) {
      ReportService.instance = new ReportService();
    }
    return ReportService.instance;
  }

  /**
   * Export DOM element to PDF
   */
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

  /**
   * Export canvas to PDF
   */
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

  /**
   * Export data to Excel
   */
  async exportToExcel(
    data: ReportData,
    options: ExcelExportOptions = {}
  ): Promise<void> {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    // Group items by type
    const apps = data.items
      .filter((i) => i.type === 'app')
      .map((i) => ({ Name: i.name, ...i.metrics, ...i.details }));
    const campaigns = data.items
      .filter((i) => i.type === 'campaign')
      .map((i) => ({ Name: i.name, ...i.metrics, ...i.details }));
    const posts = data.items
      .filter((i) => i.type === 'post')
      .map((i) => ({ Name: i.name, ...i.metrics, ...i.details }));

    if (apps.length > 0) {
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(apps),
        options.sheetName || 'Apps'
      );
    }
    if (campaigns.length > 0) {
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(campaigns),
        'Campaigns'
      );
    }
    if (posts.length > 0) {
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(posts),
        'Posts'
      );
    }

    // Summary sheet
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
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(summary),
        'Summary'
      );
    }

    XLSX.writeFile(wb, options.filename || 'report.xlsx');
  }

  /**
   * Export data to CSV
   */
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

  /**
   * Export multiple elements to PDF
   */
  async exportMultipleToPDF(
    elementIds: string[],
    options: PDFExportOptions = {}
  ): Promise<void> {
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    const pdf = new jsPDF('p', 'mm', 'a4');

    for (let i = 0; i < elementIds.length; i++) {
      const element = document.getElementById(elementIds[i]);
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
