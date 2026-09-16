import {
  escapeHtml,
  renderContactLine,
  renderDateRange,
  renderBullets,
  renderSectionBlock,
} from '../../src/templates/renderResumeToHtml';
import type {TemplateStyles} from '../../src/templates/types';
import type {
  PersonalInfoData,
  ResumeSection,
} from '../../src/types/resume';

describe('renderResumeToHtml', () => {
  const mockStyles: TemplateStyles = {
    sectionHeader: 'sh',
    entry: 'e',
    entryTitle: 'et',
    entryMeta: 'em',
    entryBody: 'eb',
    bullet: 'b',
    skillsUncategorized: 'su',
    skillsGroupTitle: 'sgt',
    skillsGroupItems: 'sgi',
    customContent: 'cc',
    customEntry: 'ce',
    customEntryTitle: 'cet',
    customEntryBody: 'ceb',
  };

  describe('escapeHtml', () => {
    it('returns empty string for null/undefined', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });

    it('escapes special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
      );
      expect(escapeHtml("it's")).toBe("it&#039;s");
      expect(escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('passes through plain text', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });
  });

  describe('renderContactLine', () => {
    const baseInfo: PersonalInfoData = {
      emails: [],
      phoneNumbers: [],
      addresses: [],
      links: [],
    };

    it('returns empty string for no contacts', () => {
      expect(renderContactLine(baseInfo)).toBe('');
    });

    it('formats emails, phones, addresses, and links with · separator', () => {
      const info: PersonalInfoData = {
        ...baseInfo,
        emails: [{id: '1', value: 'a@b.com'}],
        phoneNumbers: [{id: '2', value: '555-1234'}],
        addresses: [{id: '3', value: '123 Main St'}],
        links: [{id: '4', value: 'https://example.com', label: 'Portfolio'}],
      };
      expect(renderContactLine(info)).toBe(
        'a@b.com · 555-1234 · 123 Main St · Portfolio: https://example.com',
      );
    });

    it('filters empty values', () => {
      const info: PersonalInfoData = {
        ...baseInfo,
        emails: [{id: '1', value: ''}],
        phoneNumbers: [{id: '2', value: '555-1234'}],
        addresses: [{id: '3', value: ''}],
        links: [{id: '4', value: ''}],
      };
      expect(renderContactLine(info)).toBe('555-1234');
    });

    it('escapes HTML in contact values', () => {
      const info: PersonalInfoData = {
        ...baseInfo,
        emails: [{id: '1', value: 'test@<script>.com'}],
      };
      expect(renderContactLine(info)).toBe('test@&lt;script&gt;.com');
    });
  });

  describe('renderDateRange', () => {
    it('returns empty string when no dates', () => {
      expect(renderDateRange()).toBe('');
    });

    it('renders start and end', () => {
      expect(renderDateRange('2020-01', '2022-01')).toBe('2020-01 – 2022-01');
    });

    it('shows Present when isCurrent is true', () => {
      expect(renderDateRange('2020-01', null, true)).toBe('2020-01 – Present');
    });

    it('handles null endDate without isCurrent', () => {
      expect(renderDateRange('2020-01', null)).toBe('2020-01');
    });

    it('trims whitespace', () => {
      expect(renderDateRange('  2020-01  ', '  2022-01  ')).toBe('2020-01 – 2022-01');
    });
  });

  describe('renderBullets', () => {
    it('returns empty string for empty array', () => {
      expect(renderBullets([])).toBe('');
      expect(renderBullets(undefined)).toBe('');
    });

    it('renders bullet list', () => {
      expect(renderBullets(['a', 'b', 'c'])).toBe(
        '<div class="bullet">• a</div><div class="bullet">• b</div><div class="bullet">• c</div>',
      );
    });

    it('filters falsy values', () => {
      expect(renderBullets(['a', '', null as unknown as string, 'b'])).toBe(
        '<div class="bullet">• a</div><div class="bullet">• b</div>',
      );
    });

    it('escapes HTML in bullets', () => {
      expect(renderBullets(['<xss>'])).toBe('<div class="bullet">• &lt;xss&gt;</div>');
    });
  });

  describe('renderSectionBlock', () => {
    it('renders personal info with name and contact', () => {
      const section: ResumeSection = {
        id: '1',
        type: 'personalInfo',
        visible: true,
        order: 0,
        data: {
          fullName: 'Jane Doe',
          emails: [{id: 'e1', value: 'jane@example.com'}],
          phoneNumbers: [],
          addresses: [],
          links: [],
        },
      };
      const html = renderSectionBlock(section, mockStyles);
      expect(html).toContain('Jane Doe');
      expect(html).toContain('jane@example.com');
    });

    it('renders intro with headline and summary', () => {
      const section: ResumeSection = {
        id: '2',
        type: 'intro',
        visible: true,
        order: 1,
        data: {
          headline: 'Product Manager',
          summary: 'Building great products.',
        },
      };
      const html = renderSectionBlock(section, mockStyles);
      expect(html).toContain('Product Manager');
      expect(html).toContain('Building great products.');
    });

    it('renders experience entries', () => {
      const section: ResumeSection = {
        id: '3',
        type: 'experience',
        visible: true,
        order: 2,
        entries: [
          {
            id: 'e1',
            role: 'Engineer',
            company: 'Acme',
            startDate: '2020-01',
            endDate: '2022-01',
            isCurrent: false,
            summary: 'Did stuff.',
            achievements: ['Built X'],
            responsibilities: [],
            technologies: [],
            order: 0,
          },
        ],
      };
      const html = renderSectionBlock(section, mockStyles);
      expect(html).toContain('Engineer @ Acme');
      expect(html).toContain('2020-01 – 2022-01');
      expect(html).toContain('Did stuff.');
      expect(html).toContain('Built X');
    });

    it('renders project entries', () => {
      const section: ResumeSection = {
        id: '4',
        type: 'projects',
        visible: true,
        order: 3,
        entries: [
          {
            id: 'p1',
            name: 'MyApp',
            startDate: '2021-01',
            endDate: '2022-01',
            description: 'A cool app.',
            achievements: ['Shipped v1'],
            responsibilities: [],
            technologies: ['React'],
            order: 0,
          },
        ],
      };
      const html = renderSectionBlock(section, mockStyles);
      expect(html).toContain('MyApp');
      expect(html).toContain('2021-01 – 2022-01');
      expect(html).toContain('A cool app.');
      expect(html).toContain('Shipped v1');
    });

    it('renders education entries', () => {
      const section: ResumeSection = {
        id: '5',
        type: 'education',
        visible: true,
        order: 4,
        entries: [
          {
            id: 'ed1',
            degree: 'BS CS',
            institution: 'MIT',
            startDate: '2016-09',
            endDate: '2020-05',
            isCurrent: false,
            achievements: ["Dean's List"],
            order: 0,
          },
        ],
      };
      const html = renderSectionBlock(section, mockStyles);
      expect(html).toContain('BS CS @ MIT');
      expect(html).toContain('2016-09 – 2020-05');
      expect(html).toContain('Dean&#039;s List');
    });

    it('renders certifications entries', () => {
      const section: ResumeSection = {
        id: '6',
        type: 'certifications',
        visible: true,
        order: 5,
        entries: [
          {
            id: 'c1',
            name: 'AWS Certified',
            issuer: 'Amazon',
            issueDate: '2023-01',
            order: 0,
          },
        ],
      };
      const html = renderSectionBlock(section, mockStyles);
      expect(html).toContain('AWS Certified');
      expect(html).toContain('Amazon · 2023-01');
    });

    it('renders skills with uncategorized and groups', () => {
      const section: ResumeSection = {
        id: '7',
        type: 'skills',
        visible: true,
        order: 6,
        groups: [
          {
            id: 'g1',
            title: 'Languages',
            skills: [{id: 's1', name: 'JavaScript'}, {id: 's2', name: 'Python'}],
          },
        ],
        uncategorized: [{id: 's3', name: 'Git'}],
      };
      const html = renderSectionBlock(section, mockStyles);
      expect(html).toContain('Git');
      expect(html).toContain('Languages');
      expect(html).toContain('JavaScript');
      expect(html).toContain('Python');
    });

    it('renders custom sections', () => {
      const section: ResumeSection = {
        id: '8',
        type: 'custom',
        visible: true,
        order: 7,
        data: {
          content: 'Custom content here.',
          entries: [
            {id: 'ce1', title: 'Award', content: 'Best Developer 2023'},
          ],
        },
      };
      const html = renderSectionBlock(section, mockStyles);
      expect(html).toContain('Custom content here.');
      expect(html).toContain('Award');
      expect(html).toContain('Best Developer 2023');
    });
  });
});
