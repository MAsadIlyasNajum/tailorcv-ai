const mockedSaveLatestAnalysis = jest.fn();
const mockedGetLatestAnalysis = jest.fn();
const mockedClearLatestAnalysis = jest.fn();

jest.mock('../src/services/storage/storage', () => ({
  saveLatestAnalysis: (...args: unknown[]) => mockedSaveLatestAnalysis(...args),
  getLatestAnalysis: () => mockedGetLatestAnalysis(),
  clearLatestAnalysis: () => mockedClearLatestAnalysis(),
}));

import {useResumeStore} from '../src/store/useResumeStore';

describe('useResumeStore persistence', () => {
  beforeEach(() => {
    mockedSaveLatestAnalysis.mockReset();
    mockedGetLatestAnalysis.mockReset();
    mockedClearLatestAnalysis.mockReset();
    useResumeStore.getState().clearAll();
  });

  it('hydrates latest snapshot from storage', () => {
    mockedGetLatestAnalysis.mockReturnValue({
      resumeText: 'Persisted resume text',
      jobDescription: 'Persisted job description with enough details for meaningful ATS analysis.',
      analysisResult: {
        id: 'analysis-1',
        resumeId: 'resume-1',
        jobDescription: 'Persisted job description with enough details for meaningful ATS analysis.',
        matchScore: 75,
        missingKeywords: ['Kotlin'],
        suggestedSummary: 'Persisted summary',
        suggestedSkills: ['TypeScript'],
        experienceImprovements: [],
        atsTips: ['Use ATS-safe section titles'],
        createdAt: 123,
      },
      finalResumeOutput: {
        id: 'final-1',
        analysisId: 'analysis-1',
        refinedSummary: 'Persisted final summary',
        prioritizedKeywords: ['TypeScript'],
        polishedExperienceSections: [
          {
            heading: 'Senior Engineer - Example Co',
            polishedSummary: 'Improved delivery quality in production.',
            polishedBullets: ['Improved release reliability through automation.'],
          },
        ],
        finalRecommendations: ['Keep claims evidence-based.'],
        cautions: ['Do not add unsupported metrics.'],
        createdAt: 124,
      },
      resumeMetadata: {
        id: 'resume-1',
        name: 'resume.pdf',
        uri: 'file:///resume.pdf',
        size: 1200,
        mimeType: 'application/pdf',
        extension: 'pdf',
        selectedAt: '2026-08-13T00:00:00.000Z',
      },
    });

    useResumeStore.getState().hydrateLatest();

    const state = useResumeStore.getState();
    expect(state.resumeText).toBe('Persisted resume text');
    expect(state.jobDescription).toContain('Persisted job description');
    expect(state.analysisResult?.id).toBe('analysis-1');
    expect(state.finalResumeOutput?.id).toBe('final-1');
    expect(state.resumeMetadata?.name).toBe('resume.pdf');
  });

  it('persists analysis-related updates', () => {
    useResumeStore.getState().setResumeText('Resume body');
    useResumeStore.getState().setJobDescription(
      'Job description with enough content to satisfy the minimum length requirement for validation.',
    );

    useResumeStore.getState().setAnalysisResult({
      id: 'analysis-2',
      resumeId: 'resume-2',
      jobDescription: 'Job description with enough content to satisfy the minimum length requirement for validation.',
      matchScore: 88,
      missingKeywords: ['CI/CD'],
      suggestedSummary: 'Summary',
      suggestedSkills: ['React Native'],
      experienceImprovements: [],
      atsTips: ['Include measurable outcomes'],
      createdAt: 456,
    });

    useResumeStore.getState().setFinalResumeOutput({
      id: 'final-2',
      analysisId: 'analysis-2',
      refinedSummary: 'Final summary',
      prioritizedKeywords: ['React Native'],
      polishedExperienceSections: [
        {
          heading: 'Mobile Engineer - Example Co',
          polishedSummary: 'Delivered mobile roadmap items in production.',
          polishedBullets: ['Reduced production defects with testing discipline.'],
        },
      ],
      finalRecommendations: ['Align bullets to JD language.'],
      cautions: ['Avoid guessing metrics.'],
      createdAt: 789,
    });

    expect(mockedSaveLatestAnalysis).toHaveBeenCalled();
    expect(useResumeStore.getState().analysisResult?.id).toBe('analysis-2');
    expect(useResumeStore.getState().finalResumeOutput?.id).toBe('final-2');
  });
});
