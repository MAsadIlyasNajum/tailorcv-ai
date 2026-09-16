import {exportResumeToPdf, buildFileName} from '../../src/services/pdf/resumePdfExporter';
import {TEMPLATES} from '../../src/templates/templateRegistry';
import type {Resume, ResumeContent} from '../../src/types/resume';
import {generatePdfFromHtml, sharePdf} from '../../src/services/pdf/pdfGenerator';

jest.mock('../../src/services/pdf/pdfGenerator', () => ({
  generatePdfFromHtml: jest.fn(async () => ({filePath: 'file:///test/resume.pdf'})),
  sharePdf: jest.fn(async () => {}),
}));

const mockGeneratePdfFromHtml = generatePdfFromHtml as jest.MockedFunction<typeof generatePdfFromHtml>;
const mockSharePdf = sharePdf as jest.MockedFunction<typeof sharePdf>;

describe('resumePdfExporter', () => {
  const baseContent: ResumeContent = {
    sections: [
      {
        id: 'pi',
        type: 'personalInfo',
        visible: true,
        order: 0,
        data: {
          fullName: 'Test User',
          emails: [{id: 'e1', value: 'test@example.com'}],
          phoneNumbers: [],
          addresses: [],
          links: [],
        },
      },
    ],
  };

  const baseResume: Resume = {
    id: 'r1',
    name: 'My Resume',
    sourceType: 'text',
    text: '',
    professionalExperiences: [],
    content: baseContent,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastUsedAt: Date.now(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buildFileName', () => {
    it('sanitizes resume name and truncates to 40 chars', () => {
      const resume: Resume = {
        ...baseResume,
        name: 'My Great Resume! @2024',
      };
      expect(buildFileName(resume)).toBe('My_Great_Resume_2024_Resume');
    });

    it('falls back to Resume when name is empty', () => {
      const resume: Resume = {...baseResume, name: ''};
      expect(buildFileName(resume)).toBe('Resume');
    });

    it('truncates long names', () => {
      const resume: Resume = {
        ...baseResume,
        name: 'A'.repeat(50),
      };
      const result = buildFileName(resume);
      expect(result.length).toBeLessThanOrEqual(50);
      expect(result).toBe(`${'A'.repeat(40)}_Resume`);
    });
  });

  describe('exportResumeToPdf', () => {
    it('generates PDF for default template', async () => {
      const resume: Resume = {...baseResume};
      await exportResumeToPdf(resume, baseContent);
      expect(mockGeneratePdfFromHtml).toHaveBeenCalledTimes(1);
      const call = mockGeneratePdfFromHtml.mock.calls[0][0];
      expect(call.fileName).toBe('My_Resume_Resume');
      expect(call.htmlContent).toContain('<!DOCTYPE html>');
    });

    it('uses resume templateId when set', async () => {
      const resume: Resume = {...baseResume, templateId: 'modern'};
      await exportResumeToPdf(resume, baseContent);
      const call = mockGeneratePdfFromHtml.mock.calls[0][0];
      expect(call.htmlContent).toContain('border-left: 4px solid #2563EB');
    });

    it('shares the generated PDF', async () => {
      const resume: Resume = {...baseResume};
      await exportResumeToPdf(resume, baseContent);
      expect(mockSharePdf).toHaveBeenCalledWith('file:///test/resume.pdf');
    });

    it('throws for unknown template', async () => {
      const resume: Resume = {...baseResume, templateId: 'unknown'};
      await expect(exportResumeToPdf(resume, baseContent)).rejects.toThrow(
        'Unknown template: unknown',
      );
    });

    it('passes correct HTML for each template', async () => {
      for (const [id, template] of Object.entries(TEMPLATES)) {
        const resume: Resume = {...baseResume, templateId: id};
        await exportResumeToPdf(resume, baseContent);
        const call = mockGeneratePdfFromHtml.mock.calls.at(-1)?.[0];
        expect(call?.htmlContent).toContain(template.id);
      }
    });

    it('does not mutate input content', async () => {
      const contentBefore = JSON.stringify(baseContent);
      const resume: Resume = {...baseResume};
      await exportResumeToPdf(resume, baseContent);
      expect(JSON.stringify(baseContent)).toBe(contentBefore);
    });

    it('does not mutate input resume', async () => {
      const resumeBefore = JSON.stringify(baseResume);
      await exportResumeToPdf(baseResume, baseContent);
      expect(JSON.stringify(baseResume)).toBe(resumeBefore);
    });
  });
});
