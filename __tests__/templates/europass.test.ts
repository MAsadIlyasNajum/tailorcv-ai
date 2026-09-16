import {europassTemplate} from '../../src/templates/europass';
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
        addresses: [{id: 'a1', value: '123 Main St'}],
        links: [{id: 'l1', value: 'https://jane.dev', label: 'Portfolio'}],
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

describe('europassTemplate', () => {
  it('renders valid HTML', () => {
    const html = europassTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html>');
    expect(html).toContain('</html>');
  });

  it('renders name left-aligned', () => {
    const html = europassTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('Jane Doe');
    expect(html).toContain('text-align: left');
  });

  it('renders labeled contact fields inline', () => {
    const html = europassTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('Email: jane@example.com');
    expect(html).toContain('Phone: 555-1234');
    expect(html).toContain('Address: 123 Main St');
    expect(html).toContain('Portfolio: https://jane.dev');
  });

  it('renders headline and summary', () => {
    const html = europassTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('Software Engineer');
    expect(html).toContain('Experienced developer.');
  });

  it('uses uppercase section headers with top border and letter-spacing', () => {
    const html = europassTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('text-transform: uppercase');
    expect(html).toContain('letter-spacing: 0.5px');
    expect(html).toContain('border-top: 1px solid #E2E8F0');
  });

  it('renders experience entries compactly', () => {
    const html = europassTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('Senior Engineer @ Acme Corp');
    expect(html).toContain('2020-01 – 2022-01');
    expect(html).toContain('Improved API latency 40%');
  });

  it('renders skills as inline separated text', () => {
    const html = europassTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('Git');
    expect(html).toContain('Languages');
    expect(html).toContain('JavaScript');
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
      const html = europassTemplate.render(filteredContent, sampleResume);
      expect(html).not.toContain('Hidden');
      expect(html).not.toContain('Secret');
    });

  it('renders empty state when no visible sections', () => {
    const emptyContent: ResumeContent = {sections: []};
    const html = europassTemplate.render(emptyContent, sampleResume);
    expect(html).toContain('No visible sections');
  });

  it('includes page break control', () => {
    const html = europassTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('page-break-inside: avoid');
  });

  it('does not use tables for layout', () => {
    const html = europassTemplate.render(sampleContent, sampleResume);
    expect(html).not.toContain('<table');
  });

  it('does not include images by default', () => {
    const html = europassTemplate.render(sampleContent, sampleResume);
    expect(html).not.toContain('<img');
  });

  it('does not mutate input', () => {
    const before = JSON.stringify(sampleContent);
    europassTemplate.render(sampleContent, sampleResume);
    expect(JSON.stringify(sampleContent)).toBe(before);
  });
});
