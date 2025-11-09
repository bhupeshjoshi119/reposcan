import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFContent {
  title: string;
  sections: PDFSection[];
  metadata?: {
    author?: string;
    subject?: string;
    keywords?: string[];
    createdAt?: Date;
  };
}

export interface PDFSection {
  heading: string;
  content: PDFContentItem[];
  level?: 1 | 2 | 3;
}

export interface PDFContentItem {
  type: 'text' | 'bullet' | 'highlight' | 'underline' | 'bold' | 'code' | 'link';
  content: string;
  style?: {
    color?: string;
    backgroundColor?: string;
    fontSize?: number;
    indent?: number;
  };
}

export class BeautifulPDFGenerator {
  private pdf: jsPDF;
  private currentY: number = 20;
  private pageHeight: number;
  private pageWidth: number;
  private margin: number = 20;
  private lineHeight: number = 7;

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageHeight = this.pdf.internal.pageSize.height;
    this.pageWidth = this.pdf.internal.pageSize.width;
  }

  private checkPageBreak(requiredHeight: number = 10): void {
    if (this.currentY + requiredHeight > this.pageHeight - this.margin) {
      this.pdf.addPage();
      this.currentY = this.margin;
    }
  }

  private addTitle(title: string): void {
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(44, 62, 80); // Dark blue-gray
    
    const titleWidth = this.pdf.getTextWidth(title);
    const x = (this.pageWidth - titleWidth) / 2;
    
    this.pdf.text(title, x, this.currentY);
    this.currentY += 15;
    
    // Add underline
    this.pdf.setDrawColor(52, 152, 219); // Blue
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.margin, this.currentY - 5, this.pageWidth - this.margin, this.currentY - 5);
    this.currentY += 10;
  }

  private addHeading(text: string, level: number = 1): void {
    this.checkPageBreak(15);
    
    const fontSize = level === 1 ? 18 : level === 2 ? 16 : 14;
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(44, 62, 80);
    
    this.pdf.text(text, this.margin, this.currentY);
    this.currentY += this.lineHeight + 3;
  }

  private addText(text: string, style?: PDFContentItem['style']): void {
    this.checkPageBreak();
    
    this.pdf.setFontSize(style?.fontSize || 12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(52, 73, 94); // Dark gray
    
    const maxWidth = this.pageWidth - (2 * this.margin) - (style?.indent || 0);
    const lines = this.pdf.splitTextToSize(text, maxWidth);
    
    for (const line of lines) {
      this.checkPageBreak();
      this.pdf.text(line, this.margin + (style?.indent || 0), this.currentY);
      this.currentY += this.lineHeight;
    }
  }

  private addBulletPoint(text: string, style?: PDFContentItem['style']): void {
    this.checkPageBreak();
    
    const bulletX = this.margin + (style?.indent || 0);
    const textX = bulletX + 5;
    
    // Add bullet
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(52, 152, 219); // Blue
    this.pdf.text('•', bulletX, this.currentY);
    
    // Add text
    this.pdf.setTextColor(52, 73, 94);
    const maxWidth = this.pageWidth - (2 * this.margin) - (style?.indent || 0) - 5;
    const lines = this.pdf.splitTextToSize(text, maxWidth);
    
    for (const line of lines) {
      this.checkPageBreak();
      this.pdf.text(line, textX, this.currentY);
      this.currentY += this.lineHeight;
    }
  }

  private addHighlightedText(text: string, style?: PDFContentItem['style']): void {
    this.checkPageBreak();
    
    const textWidth = this.pdf.getTextWidth(text);
    const x = this.margin + (style?.indent || 0);
    
    // Add yellow highlight background
    this.pdf.setFillColor(255, 255, 0, 0.3); // Yellow with transparency
    this.pdf.rect(x - 1, this.currentY - 4, textWidth + 2, 6, 'F');
    
    // Add text
    this.pdf.setFontSize(style?.fontSize || 12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(44, 62, 80);
    this.pdf.text(text, x, this.currentY);
    this.currentY += this.lineHeight + 2;
  }

  private addUnderlinedText(text: string, style?: PDFContentItem['style']): void {
    this.checkPageBreak();
    
    const x = this.margin + (style?.indent || 0);
    const textWidth = this.pdf.getTextWidth(text);
    
    this.pdf.setFontSize(style?.fontSize || 12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(44, 62, 80);
    this.pdf.text(text, x, this.currentY);
    
    // Add underline
    this.pdf.setDrawColor(44, 62, 80);
    this.pdf.setLineWidth(0.3);
    this.pdf.line(x, this.currentY + 1, x + textWidth, this.currentY + 1);
    
    this.currentY += this.lineHeight + 2;
  }

  private addBoldText(text: string, style?: PDFContentItem['style']): void {
    this.checkPageBreak();
    
    this.pdf.setFontSize(style?.fontSize || 12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(44, 62, 80);
    
    const maxWidth = this.pageWidth - (2 * this.margin) - (style?.indent || 0);
    const lines = this.pdf.splitTextToSize(text, maxWidth);
    
    for (const line of lines) {
      this.checkPageBreak();
      this.pdf.text(line, this.margin + (style?.indent || 0), this.currentY);
      this.currentY += this.lineHeight;
    }
  }

  private addCodeBlock(code: string, style?: PDFContentItem['style']): void {
    this.checkPageBreak(20);
    
    const x = this.margin + (style?.indent || 0);
    const maxWidth = this.pageWidth - (2 * this.margin) - (style?.indent || 0);
    
    // Add background
    this.pdf.setFillColor(248, 249, 250); // Light gray
    this.pdf.setDrawColor(233, 236, 239); // Border gray
    this.pdf.rect(x, this.currentY - 4, maxWidth, 15, 'FD');
    
    // Add code text
    this.pdf.setFontSize(10);
    this.pdf.setFont('courier', 'normal');
    this.pdf.setTextColor(86, 61, 124); // Purple
    
    const lines = this.pdf.splitTextToSize(code, maxWidth - 4);
    this.currentY += 2;
    
    for (const line of lines) {
      this.checkPageBreak();
      this.pdf.text(line, x + 2, this.currentY);
      this.currentY += 5;
    }
    
    this.currentY += 5;
  }

  private addLink(text: string, url: string, style?: PDFContentItem['style']): void {
    this.checkPageBreak();
    
    const x = this.margin + (style?.indent || 0);
    
    this.pdf.setFontSize(style?.fontSize || 12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(52, 152, 219); // Blue
    
    this.pdf.textWithLink(text, x, this.currentY, { url });
    
    // Add underline for link
    const textWidth = this.pdf.getTextWidth(text);
    this.pdf.setDrawColor(52, 152, 219);
    this.pdf.setLineWidth(0.2);
    this.pdf.line(x, this.currentY + 1, x + textWidth, this.currentY + 1);
    
    this.currentY += this.lineHeight + 2;
  }

  public generatePDF(content: PDFContent): jsPDF {
    // Add metadata
    if (content.metadata) {
      this.pdf.setProperties({
        title: content.title,
        subject: content.metadata.subject || 'Generated Report',
        author: content.metadata.author || 'PDF Generator',
        keywords: content.metadata.keywords?.join(', ') || '',
        creator: 'Beautiful PDF Generator'
      });
    }

    // Add title
    this.addTitle(content.title);

    // Add creation date
    const now = new Date();
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'italic');
    this.pdf.setTextColor(149, 165, 166);
    this.pdf.text(`Generated on: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, this.margin, this.currentY);
    this.currentY += 15;

    // Process sections
    for (const section of content.sections) {
      this.addHeading(section.heading, section.level || 1);
      
      for (const item of section.content) {
        switch (item.type) {
          case 'text':
            this.addText(item.content, item.style);
            break;
          case 'bullet':
            this.addBulletPoint(item.content, item.style);
            break;
          case 'highlight':
            this.addHighlightedText(item.content, item.style);
            break;
          case 'underline':
            this.addUnderlinedText(item.content, item.style);
            break;
          case 'bold':
            this.addBoldText(item.content, item.style);
            break;
          case 'code':
            this.addCodeBlock(item.content, item.style);
            break;
          case 'link':
            this.addLink(item.content, item.content, item.style);
            break;
        }
      }
      
      this.currentY += 5; // Add space between sections
    }

    // Add footer to all pages
    const pageCount = this.pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(149, 165, 166);
      this.pdf.text(`Page ${i} of ${pageCount}`, this.pageWidth - 30, this.pageHeight - 10);
    }

    return this.pdf;
  }

  public async downloadPDF(content: PDFContent, filename: string = 'report.pdf'): Promise<void> {
    const pdf = this.generatePDF(content);
    pdf.save(filename);
  }

  public getPDFBlob(content: PDFContent): Blob {
    const pdf = this.generatePDF(content);
    return pdf.output('blob');
  }
}