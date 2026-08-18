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

  Card.Title = ({title}: {title: string}) =>
    ReactMock.createElement(MockText, null, title);
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

import {FinalResumeOutputScreen} from '../src/screens/FinalResumeOutputScreen';
import {useResumeStore} from '../src/store/useResumeStore';

describe('FinalResumeOutputScreen', () => {
  beforeEach(() => {
    useResumeStore.getState().clearAll();
  });

  it('renders empty state when no final output exists', () => {
    const tree = renderer.create(<FinalResumeOutputScreen />).toJSON();
    expect(JSON.stringify(tree)).toContain('No final output available yet.');
  });

  it('renders polished sections when final output exists', () => {
    useResumeStore.getState().setFinalResumeOutput({
      id: 'final-3',
      analysisId: 'analysis-3',
      refinedSummary: 'Refined summary content',
      prioritizedKeywords: ['React Native', 'TypeScript'],
      polishedExperienceSections: [
        {
          heading: 'Senior Engineer - Example Co',
          polishedSummary: 'Led mobile platform quality improvements.',
          polishedBullets: ['Improved reliability through release automation.'],
        },
      ],
      finalRecommendations: ['Keep sections concise.'],
      cautions: ['Avoid unsupported claims.'],
      createdAt: Date.now(),
    });

    const tree = renderer.create(<FinalResumeOutputScreen />).toJSON();
    const serialized = JSON.stringify(tree);

    expect(serialized).toContain('Refined Summary');
    expect(serialized).toContain('Prioritized Keywords');
    expect(serialized).toContain('Polished Experience Sections');
  });
});
