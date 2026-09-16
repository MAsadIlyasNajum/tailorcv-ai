import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AppNavigator} from './src/app/navigation/AppNavigator';
import {useResumeStore} from './src/store/useResumeStore';
import {hasMigrated, migrateLegacySnapshot, getSchemaVersion, setSchemaVersion, runResumeModelMigration} from './src/services/storage/storage';
import {trackEvent} from './src/services/analytics/analytics';
import {initCrashReporting} from './src/services/analytics/crashReporting';
import {loadAnalyticsEvents} from './src/services/analytics/analytics';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FAF8FF',
    card: '#FFFFFF',
    text: '#131B2E',
    primary: '#004AC6',
    border: '#E2E8F0',
  },
};

function App(): React.JSX.Element {
  const hydrateLatest = useResumeStore(state => state.hydrateLatest);

  React.useEffect(() => {
    const performMigration = (): void => {
      if (hasMigrated()) {
        return;
      }

      const legacy = require('./src/services/storage/storage').getLatestAnalysis();
      if (legacy) {
        migrateLegacySnapshot(legacy);
      }
    };

    performMigration();
    runResumeModelMigration();
    hydrateLatest();
    loadAnalyticsEvents();
    if (getSchemaVersion() < 1) {
      setSchemaVersion(1);
    }
    initCrashReporting();
    trackEvent('app_opened');
  }, [hydrateLatest]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8FF" />
      <NavigationContainer theme={navTheme}>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
