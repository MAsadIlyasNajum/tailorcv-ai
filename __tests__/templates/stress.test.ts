import {TEMPLATES} from '../../src/templates/templateRegistry';
import type {ResumeContent, Resume} from '../../src/types/resume';

function makeStressContent(): ResumeContent {
  const sections = [
    {
      id: 'pi',
      type: 'personalInfo',
      visible: true,
      order: 0,
      data: {
        fullName: 'Stress Test User',
        emails: [{id: 'e1', value: 'stress@test.com'}],
        phoneNumbers: [{id: 'p1', value: '555-0000'}],
        addresses: [],
        links: [],
      },
    },
    {
      id: 'exp',
      type: 'experience',
      visible: true,
      order: 1,
      entries: Array.from({length: 20}, (_, i) => ({
        id: `exp-${i}`,
        role: `Role ${i}`,
        company: `Company ${i}`,
        startDate: `201${i % 10}-01`,
        endDate: `201${(i + 1) % 10}-01`,
        isCurrent: i === 19,
        summary: `Summary ${i}`,
        achievements: [`Achievement ${i}`],
        responsibilities: [],
        technologies: [`Tech ${i}`],
        order: i,
      })),
    },
    {
      id: 'proj',
      type: 'projects',
      visible: true,
      order: 2,
      entries: Array.from({length: 50}, (_, i) => ({
        id: `proj-${i}`,
        name: `Project ${i}`,
        startDate: `202${i % 4}-01`,
        endDate: `202${(i + 1) % 4}-01`,
        isCurrent: i === 49,
        description: `Description ${i}`,
        achievements: [`Achievement ${i}`],
        responsibilities: [],
        technologies: [`Tech ${i}`],
        order: i,
      })),
    },
    {
      id: 'edu',
      type: 'education',
      visible: true,
      order: 3,
      entries: Array.from({length: 10}, (_, i) => ({
        id: `edu-${i}`,
        degree: `Degree ${i}`,
        institution: `Institution ${i}`,
        startDate: `201${i % 10}-09`,
        endDate: `201${(i + 1) % 10}-05`,
        isCurrent: false,
        achievements: [`Achievement ${i}`],
        order: i,
      })),
    },
    {
      id: 'skills',
      type: 'skills',
      visible: true,
      order: 4,
      groups: [
        {
          id: 'g1',
          title: 'Group A',
          skills: Array.from({length: 50}, (_, i) => ({
            id: `skill-a-${i}`,
            name: `Skill A${i}`,
          })),
        },
        {
          id: 'g2',
          title: 'Group B',
          skills: Array.from({length: 50}, (_, i) => ({
            id: `skill-b-${i}`,
            name: `Skill B${i}`,
          })),
        },
      ],
      uncategorized: [],
    },
    {
      id: 'cert',
      type: 'certifications',
      visible: true,
      order: 5,
      entries: Array.from({length: 30}, (_, i) => ({
        id: `cert-${i}`,
        name: `Certification ${i}`,
        issuer: `Issuer ${i}`,
        issueDate: `202${i % 4}-01`,
        order: i,
      })),
    },
    {
      id: 'custom',
      type: 'custom',
      visible: true,
      order: 6,
      data: {
        content: 'Custom content for stress test.',
        entries: Array.from({length: 10}, (_, i) => ({
          id: `custom-${i}`,
          title: `Custom Section ${i}`,
          content: `Custom content ${i}`,
        })),
      },
    },
  ];
  return {sections};
}

const stressResume: Resume = {
  id: 'stress',
  name: 'Stress Test Resume',
  sourceType: 'text',
  text: '',
  professionalExperiences: [],
  content: makeStressContent(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
  lastUsedAt: Date.now(),
};

describe('template stress tests', () => {
  for (const [templateId, template] of Object.entries(TEMPLATES)) {
    describe(`${templateId} template`, () => {
      it('renders without throwing', () => {
        expect(() => template.render(stressResume.content, stressResume)).not.toThrow();
      });

      it('contains first and last experience entries', () => {
        const html = template.render(stressResume.content, stressResume);
        expect(html).toContain('Role 0');
        expect(html).toContain('Company 0');
        expect(html).toContain('Role 19');
        expect(html).toContain('Company 19');
      });

      it('contains first and last project entries', () => {
        const html = template.render(stressResume.content, stressResume);
        expect(html).toContain('Project 0');
        expect(html).toContain('Project 49');
      });

      it('contains first and last education entries', () => {
        const html = template.render(stressResume.content, stressResume);
        expect(html).toContain('Degree 0');
        expect(html).toContain('Institution 0');
        expect(html).toContain('Degree 9');
        expect(html).toContain('Institution 9');
      });

      it('contains first and last skill group items', () => {
        const html = template.render(stressResume.content, stressResume);
        expect(html).toContain('Skill A0');
        expect(html).toContain('Skill A49');
        expect(html).toContain('Skill B0');
        expect(html).toContain('Skill B49');
      });

      it('contains first and last certification entries', () => {
        const html = template.render(stressResume.content, stressResume);
        expect(html).toContain('Certification 0');
        expect(html).toContain('Issuer 0');
        expect(html).toContain('Certification 29');
        expect(html).toContain('Issuer 29');
      });

      it('contains first and last custom section entries', () => {
        const html = template.render(stressResume.content, stressResume);
        expect(html).toContain('Custom Section 0');
        expect(html).toContain('Custom Section 9');
      });

      it('does not contain truncation markers', () => {
        const html = template.render(stressResume.content, stressResume);
        expect(html).not.toContain('...');
        expect(html).not.toContain('truncated');
        expect(html).not.toContain('and more');
      });
    });
  }
});
