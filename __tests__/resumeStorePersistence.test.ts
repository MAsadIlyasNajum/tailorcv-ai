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

jest.mock('../src/services/storage/storage', () => ({
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

import {useResumeStore} from '../src/store/useResumeStore';

describe('useResumeStore persistence', () => {
  beforeEach(() => {
    mockedSaveResumes.mockReset();
    mockedSaveJobApplications.mockReset();
    mockedSaveAnalysisResults.mockReset();
    mockedSetCurrentResumeId.mockReset();
    mockedSetCurrentJobApplicationId.mockReset();
    mockedSetCurrentAnalysisId.mockReset();
    mockedSaveFinalResumeOutput.mockReset();
    mockedGetResumes.mockReset();
    mockedGetJobApplications.mockReset();
    mockedGetAnalysisResults.mockReset();
    mockedGetCurrentResumeId.mockReset();
    mockedGetCurrentJobApplicationId.mockReset();
    mockedGetCurrentAnalysisId.mockReset();
    mockedGetFinalResumeOutput.mockReset();
    mockedClearAllData.mockReset();
    mockedHasMigrated.mockReturnValue(true);
    useResumeStore.getState().clearAll();
  });

  it('hydrates collections from storage', () => {
    mockedGetResumes.mockReturnValue([
      {
        id: 'resume-1',
        name: 'Persisted Resume',
        sourceType: 'text',
        text: 'Persisted resume text',
        professionalExperiences: [],
        createdAt: 1,
        updatedAt: 1,
        lastUsedAt: 1,
      },
    ]);
    mockedGetJobApplications.mockReturnValue([
      {
        id: 'app-1',
        resumeId: 'resume-1',
        jobDescription: 'Persisted job description with enough details for meaningful ATS analysis.',
        status: 'active',
        createdAt: 1,
        updatedAt: 1,
      },
    ]);
    mockedGetAnalysisResults.mockReturnValue([
      {
        id: 'analysis-1',
        resumeId: 'resume-1',
        jobApplicationId: 'app-1',
        jobDescription: 'Persisted job description with enough details for meaningful ATS analysis.',
        matchScore: 75,
        matchingKeywords: [{term: 'React', importance: 'required'}],
        missingKeywords: [{term: 'Kotlin', importance: 'important'}],
        suggestedSummary: 'Persisted summary',
        suggestedSkills: ['TypeScript'],
        experienceImprovements: [],
        atsTips: ['Use ATS-safe section titles'],
        createdAt: 123,
        updatedAt: 123,
      },
    ]);
    mockedGetCurrentResumeId.mockReturnValue('resume-1');
    mockedGetCurrentJobApplicationId.mockReturnValue('app-1');
    mockedGetCurrentAnalysisId.mockReturnValue('analysis-1');

    useResumeStore.getState().hydrateLatest();

    const state = useResumeStore.getState();
    expect(state.resumes).toHaveLength(1);
    expect(state.jobApplications).toHaveLength(1);
    expect(state.analysisResults).toHaveLength(1);
    expect(state.currentResumeId).toBe('resume-1');
    expect(state.currentJobApplicationId).toBe('app-1');
    expect(state.currentAnalysisId).toBe('analysis-1');
  });

  it('persists analysis-related updates', () => {
    const resumeId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const appId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const analysisId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    useResumeStore.getState().addResume({
      id: resumeId,
      name: 'My Resume',
      sourceType: 'text',
      text: 'Resume body',
      professionalExperiences: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastUsedAt: Date.now(),
    });
    useResumeStore.getState().setCurrentResume(resumeId);

    useResumeStore.getState().addJobApplication({
      id: appId,
      resumeId,
      jobDescription:
        'Job description with enough content to satisfy the minimum length requirement for validation.',
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    useResumeStore.getState().setCurrentJobApplication(appId);

    useResumeStore.getState().addAnalysisResult({
      id: analysisId,
      resumeId,
      jobApplicationId: appId,
      jobDescription:
        'Job description with enough content to satisfy the minimum length requirement for validation.',
      matchScore: 88,
      matchingKeywords: [{term: 'React', importance: 'required'}],
      missingKeywords: [{term: 'CI/CD', importance: 'important'}],
      suggestedSummary: 'Summary',
      suggestedSkills: ['React Native'],
      experienceImprovements: [],
      atsTips: ['Include measurable outcomes'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    useResumeStore.getState().setCurrentAnalysis(analysisId);

    expect(mockedSaveResumes).toHaveBeenCalled();
    expect(mockedSaveJobApplications).toHaveBeenCalled();
    expect(mockedSaveAnalysisResults).toHaveBeenCalled();
    expect(useResumeStore.getState().resumes).toHaveLength(1);
    expect(useResumeStore.getState().jobApplications).toHaveLength(1);
    expect(useResumeStore.getState().analysisResults).toHaveLength(1);
    expect(useResumeStore.getState().currentAnalysisId).toBe(analysisId);
  });
});
