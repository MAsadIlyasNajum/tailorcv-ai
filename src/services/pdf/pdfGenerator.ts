import {generatePDF} from 'react-native-html-to-pdf';
import {Share} from 'react-native';

import type {FinalResumeOutput} from '../../types/resume';
import {renderFinalResumeToHtml} from './pdfTemplates';

export interface PdfExportOptions {
  fileName: string;
  htmlContent: string;
}

export interface PdfExportResult {
  filePath: string;
}

export const generatePdfFromHtml = async (
  options: PdfExportOptions,
): Promise<PdfExportResult> => {
  const {fileName, htmlContent} = options;

  const pdf = await generatePDF({
    html: htmlContent,
    fileName,
    base64: false,
    padding: 20,
    bgColor: '#FFFFFF',
  });

  if (!pdf.filePath) {
    throw new Error('PDF generation failed: no file path returned.');
  }

  const filePath = pdf.filePath.startsWith('file://')
    ? pdf.filePath
    : `file://${pdf.filePath}`;

  return {
    filePath,
  };
};

export const sharePdf = async (filePath: string): Promise<void> => {
  await Share.share({
    url: filePath,
    title: 'TailorCV AI - Final Resume',
  });
};

export const exportFinalResumeToPdf = async (
  output: FinalResumeOutput,
  companyName?: string,
  jobTitle?: string,
): Promise<PdfExportResult> => {
  const html = renderFinalResumeToHtml(output, jobTitle, companyName);
  const sanitizedCompany = (companyName ?? 'resume')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 30);
  const date = new Date().toISOString().split('T')[0];
  const fileName = `TailorCV-${sanitizedCompany}-${date}`;

  return generatePdfFromHtml({fileName, htmlContent: html});
};
