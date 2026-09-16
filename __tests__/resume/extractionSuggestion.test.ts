const mockedSaveResumes = jest.fn();
const mockedSaveJobApplications = jest.fn();
const mockedSaveAnalysisResults = jest.fn();
const mockedSetCurrentResumeId = jest.fn();
const mockedSetCurrentJobApplicationId = jest.fn();
const mockedSetCurrentAnalysisId = jest.fn();
const mockedSaveFinalResumeOutput = jest.fn();
const mockedGetResumes = jest.fn(() => []);
const mockedGetJobApplications = jest.fn(() => []);
const mockedGetAnalysisResults = jest.fn(() => []);
const mockedGetCurrentResumeId = jest.fn(() => null);
const mockedGetCurrentJobApplicationId = jest.fn(() => null);
const mockedGetCurrentAnalysisId = jest.fn(() => null);
const mockedGetFinalResumeOutput = jest.fn(() => null);
const mockedClearAllData = jest.fn();
const mockedHasMigrated = jest.fn(() => true);

jest.mock('../../src/services/storage/storage', () => ({
  saveResumes: (...args: unknown[]) => mockedSaveResumes(...args),
  saveJobApplications: (...args: unknown[]) => mockedSaveJobApplications(...args),
  saveAnalysisResults: (...args: unknown[]) => mockedSaveAnalysisResults(...args),
  setCurrentResumeId: (...args: unknown[]) => mockedSetCurrentResumeId(...args),
  setCurrentJobApplicationId: (...args: unknown[]) => mockedSetCurrentJobApplicationId(...args),
  setCurrentAnalysisId: (...args: unknown[]) => mockedSetCurrentAnalysisId(...args),
  saveFinalResumeOutput: (...args: unknown[]) => mockedSaveFinalResumeOutput(...args),
  getResumes: () => mockedGetResumes(),
  getJobApplications: () => mockedGetJobApplications(),
  getAnalysisResults: () => mockedGetAnalysisResults(),
  getCurrentResumeId: () => mockedGetCurrentResumeId(),
  getCurrentJobApplicationId: () => mockedGetCurrentJobApplicationId(),
  getCurrentAnalysisId: () => mockedGetCurrentAnalysisId(),
  getFinalResumeOutput: () => mockedGetFinalResumeOutput(),
  clearAllData: () => mockedClearAllData(),
  hasMigrated: () => mockedHasMigrated(),
  migrateLegacySnapshot: jest.fn(),
  getSchemaVersion: jest.fn(() => 1),
  setSchemaVersion: jest.fn(),
  getAnalyticsEvents: jest.fn(() => []),
  saveAnalyticsEvents: jest.fn(),
}));

import {useResumeStore} from '../../src/store/useResumeStore';
import type {ResumeContent, ResumeSection} from '../../src/types/resume';

const buildSuggestion = (): ResumeContent => ({
  sections: [
    {
      id: 'ai-personal',
      type: 'personalInfo',
      visible: true,
      order: 0,
      data: {fullName: 'AI Name', emails: [], phoneNumbers: [], addresses: [], links: []},
    } as ResumeSection,
    {
      id: 'ai-exp',
      type: 'experience',
      visible: true,
      order: 1,
      entries: [
        {
          id: 'ai-exp-1',
          company: 'AI Company',
          role: 'AI Role',
          startDate: undefined,
          endDate: null,
          isCurrent: false,
          summary: '',
          responsibilities: [],
          achievements: [],
          technologies: [],
          links: [],
          order: 0,
        },
      ],
    } as ResumeSection,
    {
      id: 'ai-proj',
      type: 'projects',
      visible: true,
      order: 2,
      entries: [
        {
          id: 'ai-proj-1',
          name: 'AI Project',
          role: '',
          description: '',
          startDate: undefined,
          endDate: null,
          responsibilities: [],
          achievements: [],
          technologies: [],
          url: '',
          githubUrl: '',
          demoUrl: '',
          associatedExperienceIds: [],
          order: 0,
        },
      ],
    } as ResumeSection,
  ],
});

describe('AI structured extraction suggestion lifecycle', () => {
  beforeEach(() => {
    mockedSaveResumes.mockReset();
    mockedGetResumes.mockReturnValue([]);
    useResumeStore.getState().clearAll();
  });

  it('stores the AI proposal without modifying canonical content', () => {
    const resumeId = useResumeStore.getState().createEmptyResume();
    const before = useResumeStore.getState().resumes.find(r => r.id === resumeId)!.content;
    const sectionCountBefore = before?.sections.length ?? 0;

    useResumeStore.getState().setResumeSuggestion(resumeId, buildSuggestion());

    const resume = useResumeStore.getState().resumes.find(r => r.id === resumeId)!;
    // canonical content is untouched
    expect(resume.content?.sections.length).toBe(sectionCountBefore);
    // proposal stored separately
    expect(resume.aiSuggestions?.sections.length).toBe(3);
  });

  it('accepts the proposal and clears it; content becomes canonical', () => {
    const resumeId = useResumeStore.getState().createEmptyResume();
    useResumeStore.getState().setResumeSuggestion(resumeId, buildSuggestion());

    useResumeStore.getState().acceptResumeSuggestion(resumeId);

    const resume = useResumeStore.getState().resumes.find(r => r.id === resumeId)!;
    expect(resume.aiSuggestions).toBeUndefined();
    const types = resume.content!.sections.map(s => s.type);
    expect(types).toContain('experience');
    expect(types).toContain('projects');
    expect(types).toContain('personalInfo');
  });

  it('rejects the proposal without touching canonical content', () => {
    const resumeId = useResumeStore.getState().createEmptyResume();
    const before = useResumeStore.getState().resumes.find(r => r.id === resumeId)!.content;
    useResumeStore.getState().setResumeSuggestion(resumeId, buildSuggestion());

    useResumeStore.getState().rejectResumeSuggestion(resumeId);

    const resume = useResumeStore.getState().resumes.find(r => r.id === resumeId)!;
    expect(resume.aiSuggestions).toBeUndefined();
    expect(resume.content).toEqual(before);
  });

  it('supports partial acceptance (one section) and keeps the rest pending', () => {
    const resumeId = useResumeStore.getState().createEmptyResume();
    useResumeStore.getState().setResumeSuggestion(resumeId, buildSuggestion());

    useResumeStore.getState().acceptResumeSuggestion(resumeId, ['experience']);

    const resume = useResumeStore.getState().resumes.find(r => r.id === resumeId)!;
    const types = resume.content!.sections.map(s => s.type);
    expect(types).toContain('experience');
    expect(types).not.toContain('projects');
    // remaining suggestions still pending
    expect(resume.aiSuggestions?.sections.map(s => s.type)).toContain('projects');
  });

  it('re-running extraction does not overwrite existing canonical content until accepted', () => {
    const resumeId = useResumeStore.getState().createEmptyResume();
    // user manually edits canonical content
    useResumeStore.getState().updateResumeContent(resumeId, prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: 'manual-exp',
          type: 'experience',
          visible: true,
          order: prev.sections.length,
          entries: [
            {
              id: 'manual-1',
              company: 'Manual Co',
              role: 'Manual Role',
              startDate: undefined,
              endDate: null,
              isCurrent: false,
              summary: '',
              responsibilities: [],
              achievements: [],
              technologies: [],
              links: [],
              order: 0,
            },
          ],
        } as ResumeSection,
      ],
    }));

    // new AI extraction arrives
    useResumeStore.getState().setResumeSuggestion(resumeId, buildSuggestion());

    const resume = useResumeStore.getState().resumes.find(r => r.id === resumeId)!;
    const companies = resume.content!.sections
      .filter(s => s.type === 'experience')
      .flatMap(s => (s as {entries: {company?: string}[]}).entries.map(e => e.company));
    expect(companies).toContain('Manual Co'); // user edit preserved
    expect(companies).not.toContain('AI Company'); // AI not applied yet
  });

  it('accepting an experience section preserves existing entries and appends AI entries', () => {
    const resumeId = useResumeStore.getState().createEmptyResume();
    useResumeStore.getState().updateResumeContent(resumeId, prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: 'manual-exp',
          type: 'experience',
          visible: true,
          order: prev.sections.length,
          entries: Array.from({length: 20}, (_, i) => ({
            id: `manual-${i}`,
            company: `Manual Co ${i}`,
            role: `Role ${i}`,
            startDate: '',
            endDate: null,
            isCurrent: false,
            summary: '',
            responsibilities: [],
            achievements: [],
            technologies: [],
            links: [],
            order: i,
          })),
        } as ResumeSection,
      ],
    }));

    const aiSuggestion: ResumeContent = {
      sections: [
        {
          id: 'ai-exp',
          type: 'experience',
          visible: true,
          order: 0,
          entries: [
            {
              id: 'ai-1',
              company: 'AI Company',
              role: 'AI Role',
              startDate: undefined,
              endDate: null,
              isCurrent: false,
              summary: '',
              responsibilities: [],
              achievements: [],
              technologies: [],
              links: [],
              order: 0,
            },
          ],
        } as ResumeSection,
      ],
    };
    useResumeStore.getState().setResumeSuggestion(resumeId, aiSuggestion);
    useResumeStore.getState().acceptResumeSuggestion(resumeId, ['experience']);

    const resume = useResumeStore.getState().resumes.find(r => r.id === resumeId)!;
    const exp = resume.content!.sections.find(s => s.type === 'experience');
    if (!exp || exp.type !== 'experience') {
      throw new Error('expected experience');
    }
    expect(exp.entries).toHaveLength(21);
    expect(exp.entries[0].id).toBe('manual-0');
    expect(exp.entries[20].company).toBe('AI Company');
    expect(exp.entries[20].id).not.toBe('ai-1');
  });

  it('accepting a skills section merges groups and deduplicates skills by name (case-insensitive)', () => {
    const resumeId = useResumeStore.getState().createEmptyResume();
    useResumeStore.getState().updateResumeContent(resumeId, prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: 'skills',
          type: 'skills',
          visible: true,
          order: prev.sections.length,
          groups: [{id: 'g1', title: 'Languages', skills: [{id: 's1', name: 'JavaScript'}]}],
          uncategorized: [{id: 's2', name: 'Git'}],
        } as ResumeSection,
      ],
    }));

    const aiSuggestion: ResumeContent = {
      sections: [
        {
          id: 'ai-skills',
          type: 'skills',
          visible: true,
          order: 0,
          groups: [
            {id: 'g2', title: 'languages', skills: [{id: 'ai-s1', name: 'typescript'}]},
            {id: 'g3', title: 'Databases', skills: [{id: 'ai-s2', name: 'PostgreSQL'}]},
          ],
          uncategorized: [{id: 'ai-s3', name: 'javascript'}, {id: 'ai-s4', name: 'Python'}],
        } as ResumeSection,
      ],
    };
    useResumeStore.getState().setResumeSuggestion(resumeId, aiSuggestion);
    useResumeStore.getState().acceptResumeSuggestion(resumeId, ['skills']);

    const resume = useResumeStore.getState().resumes.find(r => r.id === resumeId)!;
    const skills = resume.content!.sections.find(s => s.type === 'skills');
    if (!skills || skills.type !== 'skills') {
      throw new Error('expected skills');
    }
    expect(skills.groups).toHaveLength(2);
    expect(skills.groups[0].skills).toHaveLength(2);
    expect(skills.groups[0].skills.map(s => s.name)).toEqual(['JavaScript', 'typescript']);
    expect(skills.groups[1].skills).toHaveLength(1);
    expect(skills.uncategorized).toHaveLength(3);
    expect(skills.uncategorized.map(s => s.name)).toContain('Git');
    expect(skills.uncategorized.map(s => s.name)).toContain('javascript');
    expect(skills.uncategorized.map(s => s.name)).toContain('Python');
  });

  it('accepting a singleton merges fields without wiping unrelated fields', () => {
    const resumeId = useResumeStore.getState().createEmptyResume();
    useResumeStore.getState().updateResumeContent(resumeId, prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.type === 'personalInfo'
          ? {...s, data: {fullName: 'Jane Doe', emails: [{id: 'e1', value: 'jane@example.com'}], phoneNumbers: [], addresses: [], links: []}}
          : s,
      ),
    }));

    const aiSuggestion: ResumeContent = {
      sections: [
        {
          id: 'ai-pi',
          type: 'personalInfo',
          visible: true,
          order: 0,
          data: {fullName: '', emails: [], phoneNumbers: [{id: 'ai1', value: '555'}], addresses: [], links: []},
        } as ResumeSection,
      ],
    };
    useResumeStore.getState().setResumeSuggestion(resumeId, aiSuggestion);
    useResumeStore.getState().acceptResumeSuggestion(resumeId, ['personalInfo']);

    const resume = useResumeStore.getState().resumes.find(r => r.id === resumeId)!;
    const pi = resume.content!.sections.find(s => s.type === 'personalInfo');
    if (!pi || pi.type !== 'personalInfo') {
      throw new Error('expected personalInfo');
    }
    expect(pi.data.fullName).toBe('Jane Doe');
    expect((pi.data as any).emails).toHaveLength(1);
    expect((pi.data as any).phoneNumbers).toHaveLength(1);
  });

  it('accepting a custom section with a different title leaves existing custom section untouched', () => {
    const resumeId = useResumeStore.getState().createEmptyResume();
    useResumeStore.getState().updateResumeContent(resumeId, prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: 'custom1',
          type: 'custom',
          visible: true,
          order: prev.sections.length,
          title: 'Languages',
          data: {content: 'Spanish', entries: []},
        } as ResumeSection,
      ],
    }));

    const aiSuggestion: ResumeContent = {
      sections: [
        {
          id: 'ai-custom',
          type: 'custom',
          visible: true,
          order: 0,
          title: 'Awards',
          data: {content: 'Nobel', entries: []},
        } as ResumeSection,
      ],
    };
    useResumeStore.getState().setResumeSuggestion(resumeId, aiSuggestion);
    useResumeStore.getState().acceptResumeSuggestion(resumeId, ['custom']);

    const resume = useResumeStore.getState().resumes.find(r => r.id === resumeId)!;
    const custom = resume.content!.sections.find(s => s.type === 'custom');
    if (!custom || custom.type !== 'custom') {
      throw new Error('expected custom');
    }
    expect(custom.title).toBe('Languages');
    expect((custom.data as any).content).toBe('Spanish');
  });

  it('custom merge: undefined + undefined does not merge', () => {
    const resumeId = useResumeStore.getState().createEmptyResume();
    useResumeStore.getState().updateResumeContent(resumeId, prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: 'custom1',
          type: 'custom',
          visible: true,
          order: prev.sections.length,
          title: undefined,
          data: {content: 'Existing', entries: []},
        } as ResumeSection,
      ],
    }));

    const aiSuggestion: ResumeContent = {
      sections: [
        {
          id: 'ai-custom',
          type: 'custom',
          visible: true,
          order: 0,
          title: undefined,
          data: {content: 'AI Proposal', entries: []},
        } as ResumeSection,
      ],
    };
    useResumeStore.getState().setResumeSuggestion(resumeId, aiSuggestion);
    useResumeStore.getState().acceptResumeSuggestion(resumeId, ['custom']);

    const resume = useResumeStore.getState().resumes.find(r => r.id === resumeId)!;
    const customSections = resume.content!.sections.filter(s => s.type === 'custom');
    expect(customSections).toHaveLength(2);
  });

  it('custom merge: undefined + "Awards" does not merge', () => {
    const resumeId = useResumeStore.getState().createEmptyResume();
    useResumeStore.getState().updateResumeContent(resumeId, prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: 'custom1',
          type: 'custom',
          visible: true,
          order: prev.sections.length,
          title: undefined,
          data: {content: 'Existing', entries: []},
        } as ResumeSection,
      ],
    }));

    const aiSuggestion: ResumeContent = {
      sections: [
        {
          id: 'ai-custom',
          type: 'custom',
          visible: true,
          order: 0,
          title: 'Awards',
          data: {content: 'Nobel', entries: []},
        } as ResumeSection,
      ],
    };
    useResumeStore.getState().setResumeSuggestion(resumeId, aiSuggestion);
    useResumeStore.getState().acceptResumeSuggestion(resumeId, ['custom']);

    const resume = useResumeStore.getState().resumes.find(r => r.id === resumeId)!;
    const customSections = resume.content!.sections.filter(s => s.type === 'custom');
    expect(customSections).toHaveLength(2);
  });

  it('custom merge: "Awards" + undefined does not merge', () => {
    const resumeId = useResumeStore.getState().createEmptyResume();
    useResumeStore.getState().updateResumeContent(resumeId, prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: 'custom1',
          type: 'custom',
          visible: true,
          order: prev.sections.length,
          title: 'Awards',
          data: {content: 'Existing', entries: []},
        } as ResumeSection,
      ],
    }));

    const aiSuggestion: ResumeContent = {
      sections: [
        {
          id: 'ai-custom',
          type: 'custom',
          visible: true,
          order: 0,
          title: undefined,
          data: {content: 'AI Proposal', entries: []},
        } as ResumeSection,
      ],
    };
    useResumeStore.getState().setResumeSuggestion(resumeId, aiSuggestion);
    useResumeStore.getState().acceptResumeSuggestion(resumeId, ['custom']);

    const resume = useResumeStore.getState().resumes.find(r => r.id === resumeId)!;
    const customSections = resume.content!.sections.filter(s => s.type === 'custom');
    expect(customSections).toHaveLength(2);
  });

  it('custom merge: "Awards" + "Awards" merges', () => {
    const resumeId = useResumeStore.getState().createEmptyResume();
    useResumeStore.getState().updateResumeContent(resumeId, prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: 'custom1',
          type: 'custom',
          visible: true,
          order: prev.sections.length,
          title: 'Awards',
          data: {content: 'Existing', entries: [{id: 'e1', title: 'Old', content: 'old'}]},
        } as ResumeSection,
      ],
    }));

    const aiSuggestion: ResumeContent = {
      sections: [
        {
          id: 'ai-custom',
          type: 'custom',
          visible: true,
          order: 0,
          title: 'Awards',
          data: {content: '', entries: [{id: 'ai1', title: 'New', content: 'new'}]},
        } as ResumeSection,
      ],
    };
    useResumeStore.getState().setResumeSuggestion(resumeId, aiSuggestion);
    useResumeStore.getState().acceptResumeSuggestion(resumeId, ['custom']);

    const resume = useResumeStore.getState().resumes.find(r => r.id === resumeId)!;
    const custom = resume.content!.sections.find(s => s.type === 'custom');
    if (!custom || custom.type !== 'custom') {
      throw new Error('expected custom');
    }
    const customSections = resume.content!.sections.filter(s => s.type === 'custom');
    expect(custom.title).toBe('Awards');
    expect(customSections).toHaveLength(1);
    expect((custom.data as any).entries).toHaveLength(2);
  });

  it('custom merge: "Awards" + "awards" merges case-insensitively', () => {
    const resumeId = useResumeStore.getState().createEmptyResume();
    useResumeStore.getState().updateResumeContent(resumeId, prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: 'custom1',
          type: 'custom',
          visible: true,
          order: prev.sections.length,
          title: 'Awards',
          data: {content: 'Existing', entries: []},
        } as ResumeSection,
      ],
    }));

    const aiSuggestion: ResumeContent = {
      sections: [
        {
          id: 'ai-custom',
          type: 'custom',
          visible: true,
          order: 0,
          title: 'awards',
          data: {content: 'Nobel', entries: []},
        } as ResumeSection,
      ],
    };
    useResumeStore.getState().setResumeSuggestion(resumeId, aiSuggestion);
    useResumeStore.getState().acceptResumeSuggestion(resumeId, ['custom']);

    const resume = useResumeStore.getState().resumes.find(r => r.id === resumeId)!;
    const custom = resume.content!.sections.find(s => s.type === 'custom');
    if (!custom || custom.type !== 'custom') {
      throw new Error('expected custom');
    }
    const customSections = resume.content!.sections.filter(s => s.type === 'custom');
    expect(custom.title).toBe('Awards');
    expect(customSections).toHaveLength(1);
    expect((custom.data as any).content).toBe('Nobel');
  });

  it('accept all preserves manual edits in multiple sections', () => {
    const resumeId = useResumeStore.getState().createEmptyResume();
    useResumeStore.getState().updateResumeContent(resumeId, prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: 'manual-exp',
          type: 'experience',
          visible: true,
          order: prev.sections.length,
          entries: [
            {
              id: 'me1',
              company: 'Manual Co',
              role: 'Dev',
              startDate: '',
              endDate: null,
              isCurrent: false,
              summary: '',
              responsibilities: [],
              achievements: [],
              technologies: [],
              links: [],
              order: 0,
            },
          ],
        } as ResumeSection,
        {
          id: 'manual-edu',
          type: 'education',
          visible: true,
          order: prev.sections.length + 1,
          entries: [
            {
              id: 'edu1',
              institution: 'University',
              degree: 'BS',
              startDate: '',
              endDate: null,
              isCurrent: false,
              description: '',
              achievements: [],
              gpa: '',
              coursework: [],
              activities: [],
              url: '',
              links: [],
              order: 0,
            },
          ],
        } as ResumeSection,
      ],
    }));

    useResumeStore.getState().setResumeSuggestion(resumeId, buildSuggestion());
    useResumeStore.getState().acceptResumeSuggestion(resumeId);

    const resume = useResumeStore.getState().resumes.find(r => r.id === resumeId)!;
    const exp = resume.content!.sections.find(s => s.type === 'experience');
    if (!exp || exp.type !== 'experience') {
      throw new Error('expected experience');
    }
    const edu = resume.content!.sections.find(s => s.type === 'education');
    if (!edu || edu.type !== 'education') {
      throw new Error('expected education');
    }
    expect(exp.entries.some((e: any) => e.company === 'Manual Co')).toBe(true);
    expect(edu.entries.some((e: any) => e.institution === 'University')).toBe(true);
  });

  it('accepting two different proposals for same section appends without duplicates', () => {
    const resumeId = useResumeStore.getState().createEmptyResume();
    useResumeStore.getState().updateResumeContent(resumeId, prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: 'manual-exp',
          type: 'experience',
          visible: true,
          order: prev.sections.length,
          entries: [
            {
              id: 'me1',
              company: 'Manual Co',
              role: 'Dev',
              startDate: '',
              endDate: null,
              isCurrent: false,
              summary: '',
              responsibilities: [],
              achievements: [],
              technologies: [],
              links: [],
              order: 0,
            },
          ],
        } as ResumeSection,
      ],
    }));

    const suggestionA: ResumeContent = {
      sections: [
        {
          id: 'ai-a',
          type: 'experience',
          visible: true,
          order: 0,
          entries: [
            {
              id: 'ai-a1',
              company: 'AI Co A',
              role: 'Role A',
              startDate: '',
              endDate: null,
              isCurrent: false,
              summary: '',
              responsibilities: [],
              achievements: [],
              technologies: [],
              links: [],
              order: 0,
            },
          ],
        } as ResumeSection,
      ],
    };
    const suggestionB: ResumeContent = {
      sections: [
        {
          id: 'ai-b',
          type: 'experience',
          visible: true,
          order: 0,
          entries: [
            {
              id: 'ai-b1',
              company: 'AI Co B',
              role: 'Role B',
              startDate: '',
              endDate: null,
              isCurrent: false,
              summary: '',
              responsibilities: [],
              achievements: [],
              technologies: [],
              links: [],
              order: 0,
            },
          ],
        } as ResumeSection,
      ],
    };

    useResumeStore.getState().setResumeSuggestion(resumeId, suggestionA);
    useResumeStore.getState().acceptResumeSuggestion(resumeId, ['experience']);
    useResumeStore.getState().setResumeSuggestion(resumeId, suggestionB);
    useResumeStore.getState().acceptResumeSuggestion(resumeId, ['experience']);

    const resume = useResumeStore.getState().resumes.find(r => r.id === resumeId)!;
    const exp = resume.content!.sections.find(s => s.type === 'experience');
    if (!exp || exp.type !== 'experience') {
      throw new Error('expected experience');
    }
    expect(exp.entries).toHaveLength(3);
    expect(exp.entries.map((e: any) => e.company)).toEqual(['Manual Co', 'AI Co A', 'AI Co B']);
  });
});
