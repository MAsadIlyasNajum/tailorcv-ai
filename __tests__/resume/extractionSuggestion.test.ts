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
});
