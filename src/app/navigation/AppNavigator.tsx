import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text, View} from 'react-native';
import {useRoute, type RouteProp} from '@react-navigation/native';

import {ROUTES} from '../../constants/routes';
import {AnalysisResultScreen} from '../../screens/AnalysisResultScreen';
import {EditSuggestionsScreen} from '../../screens/EditSuggestionsScreen';
import {ExperienceEditorScreen} from '../../screens/ExperienceEditorScreen';
import {FinalResumeOutputScreen} from '../../screens/FinalResumeOutputScreen';
import {HistoryScreen} from '../../screens/HistoryScreen';
import {HomeScreen} from '../../screens/HomeScreen';
import {JobApplicationDetailScreen} from '../../screens/JobApplicationDetailScreen';
import {JobDescriptionScreen} from '../../screens/JobDescriptionScreen';
import {ResumeDetailScreen} from '../../screens/ResumeDetailScreen';
import {ResumesScreen} from '../../screens/ResumesScreen';
import {ResumeEditorScreen} from '../../screens/ResumeEditorScreen';
import {ResumePreviewScreen} from '../../screens/ResumePreviewScreen';
import {ResumeExtractionReviewScreen} from '../../screens/ResumeExtractionReviewScreen';
import {SettingsScreen} from '../../screens/SettingsScreen';
import {UploadResumeScreen} from '../../screens/UploadResumeScreen';

export type AppStackParamList = {
  [ROUTES.HOME]: undefined;
  [ROUTES.RESUMES]: undefined;
  [ROUTES.HISTORY]: undefined;
  [ROUTES.SETTINGS]: undefined;
  [ROUTES.UPLOAD_RESUME]: undefined;
  [ROUTES.RESUME_DETAIL]: {resumeId: string};
  [ROUTES.JOB_DESCRIPTION]: undefined;
  [ROUTES.EXPERIENCE_EDITOR]: undefined;
  [ROUTES.ANALYSIS_RESULT]: {analysisId?: string};
  [ROUTES.EDIT_SUGGESTIONS]: {analysisId?: string};
  [ROUTES.JOB_APPLICATION_DETAIL]: {jobApplicationId: string};
  [ROUTES.FINAL_RESUME_OUTPUT]: undefined;
  [ROUTES.RESUME_EDITOR]: {resumeId: string};
  [ROUTES.RESUME_PREVIEW]: {resumeId: string};
  [ROUTES.RESUME_EXTRACTION_REVIEW]: {resumeId: string};
  [ROUTES.MAIN_TABS]: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<AppStackParamList>();

const TAB_ICONS: Record<string, {outline: string; focused: string}> = {
  [ROUTES.HOME]: {outline: '⌂', focused: '⌂'},
  [ROUTES.RESUMES]: {outline: '☰', focused: '☰'},
  [ROUTES.HISTORY]: {outline: '◷', focused: '◷'},
  [ROUTES.SETTINGS]: {outline: '⚙', focused: '⚙'},
};

const TabBarIcon = ({focused, color, size}: {focused: boolean; color: string; size: number}): React.JSX.Element => {
  const route = useRoute<RouteProp<AppStackParamList>>();
  const routeName = route?.name ?? ROUTES.HOME;
  const icons = TAB_ICONS[routeName] ?? {outline: '•', focused: '•'};
  const iconName = focused ? icons.focused : icons.outline;

  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabIconText, {color, fontSize: size}, focused && styles.tabIconTextFocused]}>
        {iconName}
      </Text>
    </View>
  );
};

const MainTabs = (): React.JSX.Element => {
  const screenOptions = React.useMemo(() => ({
    headerShown: false,
    tabBarStyle: styles.tabBar,
    tabBarActiveTintColor: '#2563EB',
    tabBarInactiveTintColor: '#64748B',
    tabBarLabelStyle: styles.tabBarLabel,
    tabBarIcon: TabBarIcon,
  }), []);

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name={ROUTES.HOME} component={HomeScreen} options={{tabBarLabel: 'Home'}} />
      <Tab.Screen name={ROUTES.RESUMES} component={ResumesScreen} options={{tabBarLabel: 'Resumes'}} />
      <Tab.Screen name={ROUTES.HISTORY} component={HistoryScreen} options={{tabBarLabel: 'History'}} />
      <Tab.Screen name={ROUTES.SETTINGS} component={SettingsScreen} options={{tabBarLabel: 'Settings'}} />
    </Tab.Navigator>
  );
};

export const AppNavigator = (): React.JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.MAIN_TABS}
      screenOptions={{
        headerTintColor: '#0F172A',
        headerTitleStyle: {fontWeight: '700'},
        contentStyle: {backgroundColor: '#F8FAFC'},
      }}>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={ROUTES.UPLOAD_RESUME}
        component={UploadResumeScreen}
        options={{title: 'Upload Resume'}}
      />
      <Stack.Screen
        name={ROUTES.RESUME_DETAIL}
        component={ResumeDetailScreen}
        options={{title: 'Resume Detail'}}
      />
      <Stack.Screen
        name={ROUTES.JOB_DESCRIPTION}
        component={JobDescriptionScreen}
        options={{title: 'Job Description'}}
      />
      <Stack.Screen
        name={ROUTES.EXPERIENCE_EDITOR}
        component={ExperienceEditorScreen}
        options={{title: 'Professional Experience'}}
      />
      <Stack.Screen
        name={ROUTES.ANALYSIS_RESULT}
        component={AnalysisResultScreen}
        options={{title: 'Analysis Result'}}
      />
      <Stack.Screen
        name={ROUTES.EDIT_SUGGESTIONS}
        component={EditSuggestionsScreen}
        options={{title: 'Edit Suggestions'}}
      />
      <Stack.Screen
        name={ROUTES.JOB_APPLICATION_DETAIL}
        component={JobApplicationDetailScreen}
        options={{title: 'Application Detail'}}
      />
      <Stack.Screen
        name={ROUTES.FINAL_RESUME_OUTPUT}
        component={FinalResumeOutputScreen}
        options={{title: 'Final Resume Output'}}
      />
      <Stack.Screen
        name={ROUTES.RESUME_EDITOR}
        component={ResumeEditorScreen}
        options={{title: 'Resume Editor'}}
      />
      <Stack.Screen
        name={ROUTES.RESUME_PREVIEW}
        component={ResumePreviewScreen}
        options={{title: 'Resume Preview'}}
      />
      <Stack.Screen
        name={ROUTES.RESUME_EXTRACTION_REVIEW}
        component={ResumeExtractionReviewScreen}
        options={{title: 'AI Suggestions'}}
      />
    </Stack.Navigator>
  );
};

const styles = {
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E2E8F0',
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 12,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  tabIcon: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  tabIconText: {
    fontSize: 22,
    fontWeight: '400' as const,
  },
  tabIconTextFocused: {
    color: '#2563EB',
  },
};
