import React from 'react';
import renderer from 'react-test-renderer';

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    set: jest.fn(),
    getString: jest.fn(() => null),
    remove: jest.fn(),
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

jest.mock('react-native-safe-area-context', () => {
  const ReactMock = require('react');
  const {View: MockView} = require('react-native');
  return {
    SafeAreaView: ({children}: {children?: React.ReactNode}) =>
      ReactMock.createElement(MockView, null, children),
    SafeAreaProvider: ({children}: {children?: React.ReactNode}) =>
      ReactMock.createElement(MockView, null, children),
  };
});

import {AnalysisResultScreen} from '../src/screens/AnalysisResultScreen';
import {useResumeStore} from '../src/store/useResumeStore';

const SAMPLE_RESULT = {
  id: 'analysis-1',
  resumeId: 'resume-1',
  jobApplicationId: 'app-1',
  jobDescription: 'Job description text',
  matchScore: 88,
  matchingKeywords: [
    {term: 'React Native', importance: 'required'},
    {term: 'TypeScript', importance: 'important'},
  ],
  missingKeywords: [
    {term: 'Performance Profiling', importance: 'nice-to-have'},
    {term: 'Render performance', importance: 'important'},
  ],
  suggestedSummary: 'A suggested professional summary.',
  suggestedSkills: ['React Native', 'TypeScript'],
  experienceImprovements: [
    {
      original: 'Original bullet point.',
      improved: 'Improved bullet point.',
    },
  ],
  atsTips: ['Tip one.', 'Tip two.'],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

describe('AnalysisResultScreen', () => {
  beforeEach(() => {
    useResumeStore.getState().clearAll();
  });

  it('renders the ATS score with explanation and generate button', async () => {
    useResumeStore.getState().addAnalysisResult(SAMPLE_RESULT);
    useResumeStore.getState().setCurrentAnalysis(SAMPLE_RESULT.id);

    let rendererInstance: ReturnType<typeof renderer.create> | null = null;
    await React.act(() => {
      rendererInstance = renderer.create(<AnalysisResultScreen />);
    });
    const serialized = JSON.stringify(rendererInstance!.toJSON());

    expect(serialized).toContain('Resume Match');
    expect(serialized).toContain('88');
    expect(serialized).toContain('Keyword coverage is weighted by importance');
    expect(serialized).toContain('Keyword Coverage');
    expect(serialized).toContain('Generate Tailored Resume');
  });

  it('does not render the professional experience recommendations card', async () => {
    useResumeStore.getState().addAnalysisResult(SAMPLE_RESULT);
    useResumeStore.getState().setCurrentAnalysis(SAMPLE_RESULT.id);

    let rendererInstance: ReturnType<typeof renderer.create> | null = null;
    await React.act(() => {
      rendererInstance = renderer.create(<AnalysisResultScreen />);
    });
    const serialized = JSON.stringify(rendererInstance!.toJSON());

    expect(serialized).not.toContain('Professional Experience Recommendations');
    expect(serialized).not.toContain(
      'Add roles in the professional experience editor',
    );
  });

  it('renders the usefulness signal when a result exists', async () => {
    useResumeStore.getState().addAnalysisResult(SAMPLE_RESULT);
    useResumeStore.getState().setCurrentAnalysis(SAMPLE_RESULT.id);

    let rendererInstance: ReturnType<typeof renderer.create> | null = null;
    await React.act(() => {
      rendererInstance = renderer.create(<AnalysisResultScreen />);
    });
    const serialized = JSON.stringify(rendererInstance!.toJSON());

    expect(serialized).toContain('Was this analysis helpful?');
    expect(serialized).toContain('Yes');
    expect(serialized).toContain('No');
  });

  it('does not render the usefulness signal when there is no result', async () => {
    let rendererInstance: ReturnType<typeof renderer.create> | null = null;
    await React.act(() => {
      rendererInstance = renderer.create(<AnalysisResultScreen />);
    });
    const serialized = JSON.stringify(rendererInstance!.toJSON());

    expect(serialized).not.toContain('Was this analysis helpful?');
  });
});
