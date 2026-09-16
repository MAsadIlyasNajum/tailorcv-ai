import {generatePdfFromHtml, sharePdf} from './pdfGenerator';
import {TEMPLATES, DEFAULT_TEMPLATE_ID} from '../../templates/templateRegistry';
import type {Resume, ResumeContent} from '../../types/resume';

export interface PdfExportResult {
  filePath: string;
}

export const buildFileName = (resume: Resume): string => {
  const name = resume.name?.trim();
  if (name) {
    const sanitized = name.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_').slice(0, 40);
    return `${sanitized}_Resume`;
  }
  return 'Resume';
};

export const exportResumeToPdf = async (resume: Resume, content: ResumeContent): Promise<PdfExportResult> => {
  const templateId = resume.templateId ?? DEFAULT_TEMPLATE_ID;
  const template = TEMPLATES[templateId];
  if (!template) {
    throw new Error(`Unknown template: ${templateId}`);
  }
  const html = template.render(content, resume);
  const fileName = buildFileName(resume);
  const result = await generatePdfFromHtml({fileName, htmlContent: html});
  await sharePdf(result.filePath);
  return result;
};
