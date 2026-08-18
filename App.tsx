import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AppNavigator} from './src/app/navigation/AppNavigator';
import {appTheme} from './src/app/theme/theme';
import {useResumeStore} from './src/store/useResumeStore';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    primary: '#2563EB',
    border: '#E2E8F0',
  },
};

function App(): React.JSX.Element {
  const hydrateLatest = useResumeStore(state => state.hydrateLatest);

  React.useEffect(() => {
    hydrateLatest();
  }, [hydrateLatest]);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={appTheme}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <NavigationContainer theme={navTheme}>
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;
