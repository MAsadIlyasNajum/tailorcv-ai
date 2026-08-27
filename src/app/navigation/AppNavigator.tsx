import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {ROUTES} from '../../constants/routes';
import {AnalysisResultScreen} from '../../screens/AnalysisResultScreen';
// TODO(MVP2): Reintroduce Professional Experience as part of the
// Resume Editor / Resume Builder workflow.
// import {ExperienceEditorScreen} from '../../screens/ExperienceEditorScreen';
import {FinalResumeOutputScreen} from '../../screens/FinalResumeOutputScreen';
import {HomeScreen} from '../../screens/HomeScreen';
import {JobDescriptionScreen} from '../../screens/JobDescriptionScreen';
import {SettingsScreen} from '../../screens/SettingsScreen';
import {UploadResumeScreen} from '../../screens/UploadResumeScreen';

export type AppStackParamList = {
  [ROUTES.HOME]: undefined;
  [ROUTES.UPLOAD_RESUME]: undefined;
  [ROUTES.JOB_DESCRIPTION]: undefined;
  // TODO(MVP2): Reintroduce when Resume Builder is available.
  // [ROUTES.EXPERIENCE_EDITOR]: undefined;
  [ROUTES.ANALYSIS_RESULT]: undefined;
  [ROUTES.FINAL_RESUME_OUTPUT]: undefined;
  [ROUTES.SETTINGS]: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppNavigator = (): React.JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.HOME}
      screenOptions={{
        headerTintColor: '#0F172A',
        headerTitleStyle: {fontWeight: '700'},
        contentStyle: {backgroundColor: '#F8FAFC'},
      }}>
      <Stack.Screen name={ROUTES.HOME} component={HomeScreen} />
      <Stack.Screen
        name={ROUTES.UPLOAD_RESUME}
        component={UploadResumeScreen}
        options={{title: 'Upload Resume'}}
      />
      <Stack.Screen
        name={ROUTES.JOB_DESCRIPTION}
        component={JobDescriptionScreen}
        options={{title: 'Job Description'}}
      />
      {/* TODO(MVP2): Reintroduce when Resume Builder is available. */}
      {/* <Stack.Screen
        name={ROUTES.EXPERIENCE_EDITOR}
        component={ExperienceEditorScreen}
        options={{title: 'Professional Experience'}}
      /> */}
      <Stack.Screen
        name={ROUTES.ANALYSIS_RESULT}
        component={AnalysisResultScreen}
        options={{title: 'Analysis Result'}}
      />
      <Stack.Screen
        name={ROUTES.FINAL_RESUME_OUTPUT}
        component={FinalResumeOutputScreen}
        options={{title: 'Final Resume Output'}}
      />
      <Stack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
    </Stack.Navigator>
  );
};
