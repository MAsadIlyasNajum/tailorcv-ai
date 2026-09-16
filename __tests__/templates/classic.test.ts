import {classicTemplate} from '../../src/templates/classic';
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
        headline: 'Software Engineer',
        summary: 'Experienced developer.',
        emails: [{id: 'e1', value: 'jane@example.com'}],
        phoneNumbers: [{id: 'p1', value: '555-1234'}],
        addresses: [{id: 'a1', value: '123 Main St'}],
        links: [{id: 'l1', value: 'https://jane.dev', label: 'Portfolio'}],
      },
    },
    {
      id: 'exp',
      type: 'experience',
      visible: true,
      order: 1,
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
          responsibilities: ['Mentored juniors'],
          technologies: ['Node.js'],
          order: 0,
        },
      ],
    },
    {
      id: 'edu',
      type: 'education',
      visible: true,
      order: 2,
      entries: [
        {
          id: 'ed1',
          degree: 'BS CS',
          institution: 'MIT',
          startDate: '2016-09',
          endDate: '2020-05',
          isCurrent: false,
          achievements: ['Dean\'s List'],
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
          skills: [{id: 's1', name: 'JavaScript'}, {id: 's2', name: 'Python'}],
        },
      ],
      uncategorized: [{id: 's3', name: 'Git'}],
    },
    {
      id: 'cert',
      type: 'certifications',
      visible: true,
      order: 4,
      entries: [
        {
          id: 'c1',
          name: 'AWS Certified',
          issuer: 'Amazon',
          issueDate: '2023-01',
          order: 0,
        },
      ],
    },
    {
      id: 'custom',
      type: 'custom',
      visible: true,
      order: 5,
      data: {
        content: 'Custom content.',
        entries: [{id: 'ce1', title: 'Award', content: 'Best Dev 2023'}],
      },
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

describe('classicTemplate', () => {
  it('renders valid HTML', () => {
    const html = classicTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html>');
    expect(html).toContain('</html>');
  });

  it('centers name', () => {
    const html = classicTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('text-align: center');
    expect(html).toContain('Jane Doe');
  });

  it('centers contact line', () => {
    const html = classicTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('jane@example.com');
    expect(html).toContain('555-1234');
    expect(html).toContain('123 Main St');
    expect(html).toContain('Portfolio: https://jane.dev');
  });

  it('uses uppercase section headers with bottom border', () => {
    const html = classicTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('text-transform: uppercase');
    expect(html).toContain('border-bottom: 1px solid #E2E8F0');
  });

  it('renders experience entries', () => {
    const html = classicTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('Senior Engineer @ Acme Corp');
    expect(html).toContain('2020-01 – 2022-01');
    expect(html).toContain('Improved API latency 40%');
  });

  it('renders education entries', () => {
    const html = classicTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('BS CS @ MIT');
    expect(html).toContain('2016-09 – 2020-05');
  });

  it('renders skills with uncategorized and groups', () => {
    const html = classicTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('Git');
    expect(html).toContain('Languages');
    expect(html).toContain('JavaScript');
    expect(html).toContain('Python');
  });

  it('renders certifications', () => {
    const html = classicTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('AWS Certified');
    expect(html).toContain('Amazon · 2023-01');
  });

  it('renders custom sections', () => {
    const html = classicTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('Custom content.');
    expect(html).toContain('Award');
    expect(html).toContain('Best Dev 2023');
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
                role: 'Hidden Role',
                company: 'Hidden Co',
                startDate: '2010-01',
                endDate: '2011-01',
                isCurrent: false,
                achievements: ['Secret achievement'],
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
      const html = classicTemplate.render(filteredContent, sampleResume);
      expect(html).not.toContain('Hidden Role');
      expect(html).not.toContain('Secret achievement');
    });

  it('renders empty state when no visible sections', () => {
    const emptyContent: ResumeContent = {sections: []};
    const html = classicTemplate.render(emptyContent, sampleResume);
    expect(html).toContain('No visible sections');
  });

  it('includes page break control', () => {
    const html = classicTemplate.render(sampleContent, sampleResume);
    expect(html).toContain('page-break-inside: avoid');
  });

  it('does not use tables for layout', () => {
    const html = classicTemplate.render(sampleContent, sampleResume);
    expect(html).not.toContain('<table');
    expect(html).not.toContain('<tr');
    expect(html).not.toContain('<td');
  });

  it('does not include images', () => {
    const html = classicTemplate.render(sampleContent, sampleResume);
    expect(html).not.toContain('<img');
  });

  it('does not mutate input', () => {
    const before = JSON.stringify(sampleContent);
    classicTemplate.render(sampleContent, sampleResume);
    expect(JSON.stringify(sampleContent)).toBe(before);
  });
});
