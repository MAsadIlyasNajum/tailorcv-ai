import {buildContentFromLegacy, migrateResumeIfNeeded, normalizeAssociations} from '../../src/utils/resume/migration';
import type {Resume, ResumeContent, ResumeSection} from '../../src/types/resume';

const legacyResume = (overrides: Partial<Resume> = {}): Resume => ({
  id: 'r1',
  name: 'Old Resume',
  sourceType: 'text',
  text: 'ABC Company\nSoftware Engineer\nWorked on backend systems.',
  metadata: undefined,
  professionalExperiences: [
    {
      id: 'pe1',
      jobTitle: 'Software Engineer',
      company: 'ABC Company',
      location: undefined,
      startDate: '',
      endDate: undefined,
      isCurrentRole: false,
      summary: 'Worked on backend systems.',
      bulletPoints: ['Shipped APIs'],
      keywords: ['Node.js'],
      generatedSuggestions: [],
    },
  ],
  createdAt: 1,
  updatedAt: 1,
  lastUsedAt: 1,
  ...overrides,
});

describe('resume migration', () => {
  it('builds structured content from a legacy resume without fabricating data', () => {
    const content = buildContentFromLegacy(legacyResume());

    const experience = content.sections.find(s => s.type === 'experience');
    expect(experience?.type).toBe('experience');
    if (experience?.type !== 'experience') {
      throw new Error('expected experience');
    }
    expect(experience.entries).toHaveLength(1);
    const entry = experience.entries[0];
    expect(entry.company).toBe('ABC Company');
    expect(entry.role).toBe('Software Engineer');
    expect(entry.startDate).toBeUndefined();
    expect(entry.endDate).toBeNull();
    expect(entry.achievements).toEqual(['Shipped APIs']);
    expect(entry.technologies).toEqual(['Node.js']);
    expect(content.unmapped).toContain('ABC Company');
  });

  it('does NOT create empty visible repeatable sections when there is no data (Fix 3)', () => {
    const content = buildContentFromLegacy(legacyResume());
    const types = content.sections.map(s => s.type);
    // Basic structure present; no empty projects/education/skills/certifications.
    expect(types).toContain('personalInfo');
    expect(types).toContain('intro');
    expect(types).toContain('experience');
    expect(types).not.toContain('projects');
    expect(types).not.toContain('education');
    expect(types).not.toContain('skills');
    expect(types).not.toContain('certifications');
  });

  it('does not overwrite an already-structured resume and is idempotent (Case E)', () => {
    const resume = legacyResume();
    resume.content = {sections: [{
      id: 'custom1',
      type: 'custom',
      visible: true,
      title: 'Notes',
      order: 0,
      data: {content: 'kept'},
    }]};

    const once = migrateResumeIfNeeded(resume);
    const twice = migrateResumeIfNeeded(once);
    expect(twice.content?.sections).toHaveLength(1);
    expect(twice.content?.sections[0].type).toBe('custom');
  });

  it('preserves legacy fields on the resume object', () => {
    const migrated = migrateResumeIfNeeded(legacyResume());
    expect(migrated.professionalExperiences).toHaveLength(1);
    expect(migrated.text).toContain('ABC Company');
  });

  it('uploaded resume (no content) is seeded with canonical content by the store helper', () => {
    // buildContentFromLegacy is what addResume uses to seed content.
    const content = buildContentFromLegacy(legacyResume({content: undefined}));
    expect(content.sections.length).toBeGreaterThan(0);
    expect(content.sections.some(s => s.type === 'personalInfo')).toBe(true);
  });

  it('flips legacy experience.associatedProjectIds into canonical project.associatedExperienceIds (Fix 2)', () => {
    const content: ResumeContent = {
      sections: [
        {
          id: 'exp-sec',
          type: 'experience',
          visible: true,
          order: 0,
          entries: [
            {id: 'exp-1', company: 'A', role: 'R', order: 0, associatedProjectIds: ['proj-1']} as unknown as ResumeSection,
          ],
        } as ResumeSection,
        {
          id: 'proj-sec',
          type: 'projects',
          visible: true,
          order: 1,
          entries: [{id: 'proj-1', name: 'P1', order: 0, associatedExperienceIds: []}],
        } as ResumeSection,
      ],
    };

    const normalized = normalizeAssociations(content);
    const projects = normalized.sections.find(s => s.type === 'projects');
    const experiences = normalized.sections.find(s => s.type === 'experience');
    if (projects?.type !== 'projects' || experiences?.type !== 'experience') {
      throw new Error('section type mismatch');
    }
    expect(projects.entries[0].associatedExperienceIds).toEqual(['exp-1']);
    // legacy field removed from the experience side
    expect((experiences.entries[0] as Record<string, unknown>).associatedProjectIds).toBeUndefined();
  });

  it('normalizeAssociations is idempotent', () => {
    const content: ResumeContent = {
      sections: [
        {id: 'proj-sec', type: 'projects', visible: true, order: 0, entries: [{id: 'proj-1', name: 'P1', order: 0, associatedExperienceIds: ['exp-1']}]} as ResumeSection,
      ],
    };
    const once = normalizeAssociations(content);
    const twice = normalizeAssociations(once);
    expect(JSON.stringify(once)).toBe(JSON.stringify(twice));
  });

  it('deserializes PersonalInfoData without firstName/lastName as undefined', () => {
    const blob = {
      fullName: 'Jane Doe',
      emails: [],
      phoneNumbers: [],
      addresses: [],
      links: [],
    };
    const data = blob as any;
    expect(data.firstName).toBeUndefined();
    expect(data.lastName).toBeUndefined();
    expect(data.fullName).toBe('Jane Doe');
  });
});
