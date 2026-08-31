import {renderFinalResumeToHtml} from '../src/services/pdf/pdfTemplates';
import type {FinalResumeOutput} from '../src/types/resume';

describe('renderFinalResumeToHtml', () => {
  const baseOutput: FinalResumeOutput = {
    id: 'test-id',
    analysisId: 'analysis-id',
    refinedSummary: 'Experienced software engineer with 5+ years in React Native development.',
    prioritizedKeywords: ['React Native', 'TypeScript', 'Node.js'],
    polishedExperienceSections: [
      {
        heading: 'Senior Software Engineer',
        polishedSummary: 'Led development of mobile applications',
        polishedBullets: [
          'Built cross-platform mobile app',
          'Improved performance by 40%',
        ],
      },
    ],
    finalRecommendations: ['Add metrics to experience'],
    cautions: ['Verify all dates are accurate'],
    createdAt: Date.now(),
  };

  it('includes job title and company in header', () => {
    const html = renderFinalResumeToHtml(baseOutput, 'Software Engineer', 'Acme Corp');
    expect(html).toContain('Software Engineer');
    expect(html).toContain('Acme Corp');
  });

  it('includes refined summary', () => {
    const html = renderFinalResumeToHtml(baseOutput);
    expect(html).toContain('Experienced software engineer');
  });

  it('includes prioritized keywords', () => {
    const html = renderFinalResumeToHtml(baseOutput);
    expect(html).toContain('React Native');
    expect(html).toContain('TypeScript');
    expect(html).toContain('Node.js');
  });

  it('includes experience sections', () => {
    const html = renderFinalResumeToHtml(baseOutput);
    expect(html).toContain('Senior Software Engineer');
    expect(html).toContain('Led development of mobile applications');
    expect(html).toContain('Built cross-platform mobile app');
    expect(html).toContain('Improved performance by 40%');
  });

  it('does NOT include finalRecommendations in PDF output', () => {
    const html = renderFinalResumeToHtml(baseOutput);
    expect(html).not.toContain('Add metrics to experience');
  });

  it('does NOT include cautions in PDF output', () => {
    const html = renderFinalResumeToHtml(baseOutput);
    expect(html).not.toContain('Verify all dates are accurate');
  });

  it('uses default header when no job title provided', () => {
    const html = renderFinalResumeToHtml(baseOutput);
    expect(html).toContain('Professional Profile');
  });

  it('escapes HTML special characters', () => {
    const outputWithSpecialChars: FinalResumeOutput = {
      ...baseOutput,
      refinedSummary: 'Experience with <script> & "quotes"',
    };
    const html = renderFinalResumeToHtml(outputWithSpecialChars);
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&amp;');
    expect(html).toContain('&quot;quotes&quot;');
    expect(html).not.toContain('<script>');
  });

  it('uses standard fonts only (Arial/Helvetica)', () => {
    const html = renderFinalResumeToHtml(baseOutput);
    expect(html).toContain('Arial');
    expect(html).toContain('Helvetica');
  });

  it('does not use tables for layout', () => {
    const html = renderFinalResumeToHtml(baseOutput);
    expect(html).not.toContain('<table');
    expect(html).not.toContain('<tr');
    expect(html).not.toContain('<td');
  });

  it('does not include images', () => {
    const html = renderFinalResumeToHtml(baseOutput);
    expect(html).not.toContain('<img');
  });

  it('includes page break control for sections', () => {
    const html = renderFinalResumeToHtml(baseOutput);
    expect(html).toContain('page-break-inside: avoid');
  });
});
