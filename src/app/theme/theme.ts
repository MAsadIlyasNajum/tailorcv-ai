import {MD3LightTheme} from 'react-native-paper';

export const appTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2563EB',
    secondary: '#0F172A',
    tertiary: '#14B8A6',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
  },
};

export type AppTheme = typeof appTheme;
