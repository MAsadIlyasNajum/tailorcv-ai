import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator, type BottomTabBarProps} from '@react-navigation/bottom-tabs';

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

import {colors} from '../theme/designTokens';
import {BottomTabBar, IconSymbol} from '../../components';

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

const TAB_ITEMS: {key: string; label: string; icon: React.ReactNode; focusedIcon: React.ReactNode; pro?: boolean}[] = [
  {key: ROUTES.HOME, label: 'Home', icon: <IconSymbol name="home" size={22} color={colors.textTertiary} />, focusedIcon: <IconSymbol name="home" size={22} color={colors.primaryDark} />},
  {key: ROUTES.RESUMES, label: 'Resumes', icon: <IconSymbol name="resumes" size={22} color={colors.textTertiary} />, focusedIcon: <IconSymbol name="resumes" size={22} color={colors.primaryDark} />},
  {key: ROUTES.HISTORY, label: 'ATS History', icon: <IconSymbol name="ats" size={22} color={colors.textTertiary} />, focusedIcon: <IconSymbol name="ats" size={22} color={colors.primaryDark} />},
  {key: ROUTES.SETTINGS, label: 'Profile', icon: <IconSymbol name="profile" size={22} color={colors.textTertiary} />, focusedIcon: <IconSymbol name="profile" size={22} color={colors.primaryDark} />},
];

const renderTabBar = ({state, navigation}: BottomTabBarProps): React.JSX.Element => {
  const activeKey = state.routes[state.index]?.name ?? ROUTES.HOME;
  return (
    <BottomTabBar
      items={TAB_ITEMS}
      activeKey={activeKey}
      onNavigate={key => {
        const event = navigation.emit({type: 'tabPress', target: key, canPreventDefault: true});
        if (!event.defaultPrevented) {
          navigation.navigate(key as never);
        }
      }}
    />
  );
};

const MainTabs = (): React.JSX.Element => {
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: colors.shadowColor,
          shadowOffset: {width: 0, height: -2},
          shadowOpacity: 0.06,
          shadowRadius: 12,
        },
      }}>
      <Tab.Screen
        name={ROUTES.HOME}
        component={HomeScreen}
        options={{tabBarLabel: 'Home'}}
      />
      <Tab.Screen
        name={ROUTES.RESUMES}
        component={ResumesScreen}
        options={{tabBarLabel: 'Resumes'}}
      />
      <Tab.Screen
        name={ROUTES.HISTORY}
        component={HistoryScreen}
        options={{tabBarLabel: 'ATS History'}}
      />
      <Tab.Screen
        name={ROUTES.SETTINGS}
        component={SettingsScreen}
        options={{tabBarLabel: 'Profile'}}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = (): React.JSX.Element => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.MAIN_TABS}
      screenOptions={{
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {fontSize: 18, fontWeight: '600', fontFamily: 'Inter'},
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerShadowVisible: false,
        contentStyle: {backgroundColor: colors.background},
      }}>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name={ROUTES.UPLOAD_RESUME}
        component={UploadResumeScreen}
        options={{title: 'Save CV'}}
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
        options={{title: 'Resume Preview', headerShown: false}}
      />
      <Stack.Screen
        name={ROUTES.RESUME_EXTRACTION_REVIEW}
        component={ResumeExtractionReviewScreen}
        options={{title: 'AI Suggestions'}}
      />
    </Stack.Navigator>
  );
};