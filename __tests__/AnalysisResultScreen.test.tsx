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
}));

jest.mock('react-native-paper', () => {
  const ReactMock = require('react');
  const {Text: MockText, View: MockView} = require('react-native');
  const Card = ({children}: {children?: React.ReactNode}) =>
    ReactMock.createElement(MockView, null, children);

  Card.Title = ({
    title,
    subtitle,
  }: {
    title: string;
    subtitle?: string;
  }) =>
    ReactMock.createElement(
      MockView,
      null,
      ReactMock.createElement(MockText, null, title),
      subtitle
        ? ReactMock.createElement(MockText, null, subtitle)
        : null,
    );
  Card.Content = ({children}: {children?: React.ReactNode}) =>
    ReactMock.createElement(MockView, null, children);

  return {
    Button: ({children}: {children?: React.ReactNode}) =>
      ReactMock.createElement(MockText, null, children),
    Chip: ({children}: {children?: React.ReactNode}) =>
      ReactMock.createElement(MockText, null, children),
    Card,
  };
});

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
  jobDescription: 'Job description text',
  matchScore: 88,
  matchingKeywords: ['React Native', 'TypeScript'],
  missingKeywords: ['Performance Profiling', 'Render performance'],
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
};

describe('AnalysisResultScreen', () => {
  beforeEach(() => {
    useResumeStore.getState().clearAll();
  });

  it('renders the ATS score with an explanation and no final output button', async () => {
    useResumeStore.getState().setAnalysisResult(SAMPLE_RESULT);

    let rendererInstance: ReturnType<typeof renderer.create> | null = null;
    await React.act(() => {
      rendererInstance = renderer.create(<AnalysisResultScreen />);
    });
    const serialized = JSON.stringify(rendererInstance!.toJSON());

    expect(serialized).toContain('ATS Match Score');
    expect(serialized).toContain('88');
    expect(serialized).toContain(
      'AI-estimated match based on how closely your resume',
    );
    expect(serialized).toContain('Applicant Tracking System');
    expect(serialized).not.toContain('Generate Final Resume Output');
  });

  it('does not render the professional experience recommendations card', async () => {
    useResumeStore.getState().setAnalysisResult(SAMPLE_RESULT);

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
    useResumeStore.getState().setAnalysisResult(SAMPLE_RESULT);

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
