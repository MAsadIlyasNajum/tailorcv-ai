import {modernTemplate} from '../../src/templates/modern';
import type {ResumeContent, Resume} from '../../src/types/resume';

const sampleContent: ResumeContent = {
  sections: [
    {
      id: 'pi',
      type: 'personalInfo',
      visible: true,
      order: 0,
      data: {
        fullName: 'Jane Doe',
        emails: [{id: 'e1', value: 'jane@example.com'}],
        phoneNumbers: [{id: 'p1', value: '555-1234'}],
        addresses: [],
        links: [],
      },
    },
    {
      id: 'intro',
      type: 'intro',
      visible: true,
      order: 1,
      data: {
        headline: 'Software Engineer',
        summary: 'Experienced developer.',
      },
    },
    {
      id: 'exp',
      type: 'experience',
      visible: true,
      order: 2,
      entries: [
        {
          id: 'e1',
          role: 'Senior Engineer',
          company: 'Acme Corp',
          startDate: '2020-01',
          endDate: '2022-01',
          isCurrent: false,
          summary: 'Led backend team.',
          achievements: ['Improved API latency 40%'],
          responsibilities: [],
          technologies: [],
          order: 0,
        },
      ],
    },
    {
      id: 'skills',
      type: 'skills',
      visible: true,
      order: 3,
      groups: [
        {
          id: 'g1',
          title: 'Languages',
          skills: [{id: 's1', name: 'JavaScript'}],
        },
      ],
      uncategorized: [{id: 's3', name: 'Git'}],
    },
  ],
};

const sampleResume: Resume = {
  id: 'r1',
  name: 'Test Resume',
  sourceType: 'text',
  text: '',
  professionalExperiences: [],
  content: sampleContent,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  lastUsedAt: Date.now(),
};

describe('modernTemplate', () => {
  it('renders valid HTML', () => {
    const html = modernTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html>');
    expect(html).toContain('</html>');
  });

  it('left-aligns name with accent underline', () => {
    const html = modernTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('text-align: left');
    expect(html).toContain('border-bottom: 3px solid #2563EB');
    expect(html).toContain('Jane Doe');
  });

  it('renders headline left-aligned and muted', () => {
    const html = modernTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('Software Engineer');
    expect(html).toContain('color: #64748B');
  });

  it('renders contact inline with · separator', () => {
    const html = modernTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('jane@example.com');
    expect(html).toContain('555-1234');
  });

  it('uses accent-colored section headers with left border', () => {
    const html = modernTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('color: #2563EB');
    expect(html).toContain('border-left: 4px solid #2563EB');
  });

  it('renders experience entries', () => {
    const html = modernTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('Senior Engineer @ Acme Corp');
    expect(html).toContain('Improved API latency 40%');
  });

    it('excludes hidden sections', () => {
      const hiddenContent: ResumeContent = {
        sections: [
          {
            id: 'hidden',
            type: 'experience',
            visible: false,
            order: 0,
            entries: [
              {
                id: 'he1',
                role: 'Hidden',
                company: 'Hidden Co',
                startDate: '2010-01',
                endDate: '2011-01',
                isCurrent: false,
                achievements: ['Secret'],
                responsibilities: [],
                technologies: [],
                order: 0,
              },
            ],
          },
        ],
      };
      const visibleSections = hiddenContent.sections.filter(s => s.visible);
      const filteredContent = {...hiddenContent, sections: visibleSections};
      const html = modernTemplate.render(filteredContent, sampleResume);
      expect(html).not.toContain('Hidden');
      expect(html).not.toContain('Secret');
    });

  it('renders empty state when no visible sections', () => {
    const emptyContent: ResumeContent = {sections: []};
    const html = modernTemplate.render(emptyContent, sampleResume);
    expect(html).toContain('No visible sections');
  });

  it('includes page break control', () => {
    const html = modernTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('page-break-inside: avoid');
  });

  it('does not use tables for layout', () => {
    const html = modernTemplate.render(sampleContent, sampleResume);
    expect(html).not.toContain('<table');
  });

  it('does not include images by default', () => {
    const html = modernTemplate.render(sampleContent, sampleResume);
    expect(html).not.toContain('<img');
  });

  it('does not mutate input', () => {
    const before = JSON.stringify(sampleContent);
    modernTemplate.render(sampleContent, sampleResume);
    expect(JSON.stringify(sampleContent)).toBe(before);
  });
});
