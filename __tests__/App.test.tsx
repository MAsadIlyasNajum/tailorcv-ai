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

jest.mock('react-native-document-picker', () => ({
  __esModule: true,
  default: {
    pickSingle: jest.fn(),
  },
  isCancel: jest.fn((error: unknown) => Boolean((error as {code?: string})?.code === 'USER_CANCELED')),
  types: {
    pdf: 'com.adobe.pdf',
  },
}));

jest.mock('react-native-blob-util', () => ({
  __esModule: true,
  default: {
    fs: {
      readFile: jest.fn(async () => ''),
    },
  },
}));

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {
    GEMINI_API_KEY: 'test-api-key',
  },
}));

jest.mock('pdfjs-dist/legacy/build/pdf.mjs', () => ({
  GlobalWorkerOptions: {
    workerSrc: '',
  },
  getDocument: jest.fn(),
}));

import App from '../App';

it('renders correctly', () => {
  renderer.create(<App />);
});
