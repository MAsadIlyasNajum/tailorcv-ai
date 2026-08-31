/**
 * @format
 */

import 'react-native';
import React from 'react';
import {it} from '@jest/globals';
import renderer from 'react-test-renderer';

jest.mock('react-native-screens', () => {
  const ReactMock = require('react');
  return {
    default: {
      Screen: ({children}: {children?: React.ReactNode}) =>
        ReactMock.createElement('Screen', null, children),
      ScreenContainer: ({children}: {children?: React.ReactNode}) =>
        ReactMock.createElement('ScreenContainer', null, children),
    },
    Screen: ({children}: {children?: React.ReactNode}) =>
      ReactMock.createElement('Screen', null, children),
    ScreenContainer: ({children}: {children?: React.ReactNode}) =>
      ReactMock.createElement('ScreenContainer', null, children),
  };
});

jest.mock('@react-navigation/native-stack', () => {
  const ReactMock = require('react');
  return {
    createNativeStackNavigator: () => ({
      Navigator: ({children}: {children?: React.ReactNode}) =>
        ReactMock.createElement('Navigator', null, children),
      Screen: () => null,
    }),
  };
});

jest.mock('@react-navigation/bottom-tabs', () => {
  const ReactMock = require('react');
  return {
    createBottomTabNavigator: () => ({
      Navigator: ({children}: {children?: React.ReactNode}) =>
        ReactMock.createElement('Navigator', null, children),
      Screen: () => null,
    }),
  };
});

jest.mock('@react-navigation/native', () => {
  const ReactMock = require('react');
  return {
    NavigationContainer: ({children}: {children?: React.ReactNode}) =>
      ReactMock.createElement('NavigationContainer', null, children),
    DefaultTheme: {
      colors: {
        background: '#F8FAFC',
        card: '#FFFFFF',
        text: '#0F172A',
        primary: '#2563EB',
        border: '#E2E8F0',
      },
    },
  };
});

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    set: jest.fn(),
    getString: jest.fn(() => null),
    remove: jest.fn(),
  }),
}));

jest.mock('@react-native-documents/picker', () => ({
  __esModule: true,
  default: {
    pickSingle: jest.fn(),
  },
  isErrorWithCode: jest.fn(),
  keepLocalCopy: jest.fn(),
  types: {
    pdf: 'com.adobe.pdf',
  },
}));

jest.mock('react-native-pdf-text-extractor', () => ({
  extractText: jest.fn(async () => ''),
}));

jest.mock('react-native-html-to-pdf', () => ({
  __esModule: true,
  generatePDF: jest.fn(async () => ({filePath: '/test/path.pdf'})),
}));

jest.mock('react-native-dotenv', () => ({
  GEMINI_API_KEY: 'test-api-key',
  APP_ENV: 'test',
}));

jest.mock('react-native-safe-area-context', () => {
  const ReactMock = require('react');
  return {
    SafeAreaView: ({children}: {children?: React.ReactNode}) =>
      ReactMock.createElement('SafeAreaView', null, children),
    SafeAreaProvider: ({children}: {children?: React.ReactNode}) =>
      ReactMock.createElement('SafeAreaProvider', null, children),
  };
});

import App from '../App';

it('renders correctly', async () => {
  await React.act(() => {
    renderer.create(<App />);
  });
});
