import {
  runFinalOutputGeneration,
  runResumeAnalysis,
} from '../src/services/ai/analyzeResumeUseCase';
import {useResumeStore} from '../src/store/useResumeStore';

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    set: jest.fn(),
    getString: jest.fn(() => null),
    remove: jest.fn(),
  }),
}));

jest.mock('../src/services/ai/geminiService', () => ({
  geminiService: {
    analyzeResume: jest.fn(),
    generateFinalResumeOutput: jest.fn(),
  },
}));

import {geminiService} from '../src/services/ai/geminiService';

const mockedAnalyzeResume = geminiService.analyzeResume as jest.Mock;
const mockedGenerateFinalResumeOutput =
  geminiService.generateFinalResumeOutput as jest.Mock;

describe('runResumeAnalysis', () => {
  beforeEach(() => {
    mockedAnalyzeResume.mockReset();
    mockedGenerateFinalResumeOutput.mockReset();
    useResumeStore.getState().clearAll();
  });

  const createResume = (text: string) => {
    const resumeId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    useResumeStore.getState().addResume({
      id: resumeId,
      name: 'Test Resume',
      sourceType: 'text',
      text,
      professionalExperiences: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastUsedAt: Date.now(),
    });
    useResumeStore.getState().setCurrentResume(resumeId);
    return resumeId;
  };

  const createJobApplication = (resumeId: string, jobDescription: string) => {
    const appId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    useResumeStore.getState().addJobApplication({
      id: appId,
      resumeId,
      jobDescription,
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    useResumeStore.getState().setCurrentJobApplication(appId);
    return appId;
  };

  it('sets validation error when resume text is missing', async () => {
    createJobApplication(
      'resume-1',
      'We are hiring a React Native engineer with strong TypeScript and testing skills to build reliable mobile experiences.',
    );

    await runResumeAnalysis();

    expect(mockedAnalyzeResume).not.toHaveBeenCalled();
    expect(useResumeStore.getState().analysisError).toBe(
      'Please upload your resume first.',
    );
  });

  it('sets validation error when job description is invalid', async () => {
    createResume('Experienced engineer building React Native apps.');
    createJobApplication('resume-1', 'Short JD');

    await runResumeAnalysis();

    expect(mockedAnalyzeResume).not.toHaveBeenCalled();
    expect(useResumeStore.getState().analysisError).toContain(
      'Please provide a more detailed job description',
    );
  });

  it('stores analysis result when AI call succeeds', async () => {
    const resumeId = createResume('Resume text content with achievements.');
    createJobApplication(
      resumeId,
      'Looking for a mobile engineer with React Native, TypeScript, testing, and performance optimization experience across production apps.',
    );

    mockedAnalyzeResume.mockResolvedValue({
      id: 'analysis-1',
      resumeId: 'resume-1',
      jobDescription: 'target jd',
      matchScore: 82,
      missingKeywords: ['GraphQL'],
      suggestedSummary: 'Improved summary',
      suggestedSkills: ['React Native'],
      experienceImprovements: [{original: 'Did things', improved: 'Delivered impact'}],
      atsTips: ['Use measurable metrics'],
      createdAt: Date.now(),
    });

    await runResumeAnalysis();

    expect(mockedAnalyzeResume).toHaveBeenCalledTimes(1);
    expect(useResumeStore.getState().analysisResults).toHaveLength(1);
    expect(useResumeStore.getState().analysisResults[0].id).toBe('analysis-1');
    expect(useResumeStore.getState().currentAnalysisId).toBe('analysis-1');
    expect(useResumeStore.getState().analysisError).toBeNull();
    expect(useResumeStore.getState().isAnalyzing).toBe(false);
  });

  it('stores user-facing error when AI call fails', async () => {
    const resumeId = createResume('Resume text content with achievements.');
    createJobApplication(
      resumeId,
      'Looking for a mobile engineer with React Native, TypeScript, testing, and performance optimization experience across production apps.',
    );

    mockedAnalyzeResume.mockRejectedValue(new Error('The AI service is temporarily busy. Please try again shortly.'));

    await runResumeAnalysis();

    expect(useResumeStore.getState().analysisResults).toHaveLength(0);
    expect(useResumeStore.getState().analysisError).toBe(
      'The AI service is temporarily busy. Please try again shortly.',
    );
    expect(useResumeStore.getState().isAnalyzing).toBe(false);
  });

  it('stores final output when generation succeeds', async () => {
    const resumeId = createResume('Resume text with proven achievements.');
    const appId = createJobApplication(
      resumeId,
      'Seeking a mobile engineer with React Native, TypeScript, and quality-focused delivery experience in production environments.',
    );

    useResumeStore.getState().addAnalysisResult({
      id: 'analysis-5',
      resumeId,
      jobApplicationId: appId,
      jobDescription:
        'Seeking a mobile engineer with React Native, TypeScript, and quality-focused delivery experience in production environments.',
      matchScore: 83,
      missingKeywords: ['Kotlin'],
      suggestedSummary: 'Existing summary',
      suggestedSkills: ['React Native'],
      experienceImprovements: [{original: 'Built features', improved: 'Delivered production features'}],
      atsTips: ['Keep headings standard'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    useResumeStore.getState().setCurrentAnalysis('analysis-5');

    mockedGenerateFinalResumeOutput.mockResolvedValue({
      id: 'final-1',
      analysisId: 'analysis-5',
      refinedSummary: 'Refined and concise professional summary.',
      prioritizedKeywords: ['React Native', 'TypeScript'],
      polishedExperienceSections: [
        {
          heading: 'Senior Mobile Engineer - Example Co',
          polishedSummary: 'Led delivery of mobile features in production.',
          polishedBullets: ['Improved release quality through testing discipline.'],
        },
      ],
      finalRecommendations: ['Keep the summary targeted to the role.'],
      cautions: ['Do not claim metrics that cannot be verified.'],
      createdAt: Date.now(),
    });

    await runFinalOutputGeneration();

    expect(mockedGenerateFinalResumeOutput).toHaveBeenCalledTimes(1);
    expect(useResumeStore.getState().finalResumeOutput?.id).toBe('final-1');
    expect(useResumeStore.getState().finalOutputError).toBeNull();
    expect(useResumeStore.getState().isGeneratingFinalOutput).toBe(false);
  });

  it('sets validation error when final output generation runs without analysis', async () => {
    const resumeId = createResume('Resume text with proven achievements.');
    createJobApplication(
      resumeId,
      'Seeking a mobile engineer with React Native, TypeScript, and quality-focused delivery experience in production environments.',
    );

    await runFinalOutputGeneration();

    expect(mockedGenerateFinalResumeOutput).not.toHaveBeenCalled();
    expect(useResumeStore.getState().finalOutputError).toBe(
      'Please run analysis before generating final output.',
    );
  });
});
