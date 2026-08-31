import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AppButton, AppTextInput} from '../components';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ROUTES} from '../constants/routes';
import {runResumeAnalysis} from '../services/ai/analyzeResumeUseCase';
import {useResumeStore} from '../store/useResumeStore';
import {validateJobDescription} from '../utils/validation/jobDescriptionValidation';
import {trackEvent} from '../services/analytics/analytics';

export const JobDescriptionScreen = (): React.JSX.Element => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, typeof ROUTES.JOB_DESCRIPTION>>();
  const resumes = useResumeStore(state => state.resumes);
  const currentResumeId = useResumeStore(state => state.currentResumeId);
  const jobApplications = useResumeStore(state => state.jobApplications);
  const currentJobApplicationId = useResumeStore(state => state.currentJobApplicationId);
  const addJobApplication = useResumeStore(state => state.addJobApplication);
  const updateJobApplication = useResumeStore(state => state.updateJobApplication);
  const setCurrentJobApplication = useResumeStore(state => state.setCurrentJobApplication);
  const isAnalyzing = useResumeStore(state => state.isAnalyzing);
  const analysisError = useResumeStore(state => state.analysisError);
  const setAnalysisError = useResumeStore(state => state.setAnalysisError);

  const currentResume = useMemo(
    () => resumes.find(r => r.id === currentResumeId) ?? null,
    [resumes, currentResumeId],
  );
  const currentJobApplication = useMemo(
    () => jobApplications.find(app => app.id === currentJobApplicationId) ?? null,
    [jobApplications, currentJobApplicationId],
  );

  const resumeText = currentResume?.text ?? '';
  const [jobDescription, setJobDescription] = useState(currentJobApplication?.jobDescription ?? '');

  const validation = useMemo(
    () => validateJobDescription(jobDescription),
    [jobDescription],
  );

  const enabled = Boolean(resumeText.trim()) && validation.valid && !isAnalyzing;

  const handleAnalyze = async (): Promise<void> => {
    if (!enabled) {
      return;
    }

    trackEvent('analysis_started');

    const previousResultId = useResumeStore.getState().currentAnalysisId;

    await runResumeAnalysis();

    const nextState = useResumeStore.getState();
    const nextResultId = nextState.currentAnalysisId;

    if (!nextState.analysisError && nextResultId && nextResultId !== previousResultId) {
      trackEvent('analysis_completed');
      navigation.navigate(ROUTES.ANALYSIS_RESULT as any);
    } else if (nextState.analysisError) {
      trackEvent('analysis_failed');
    }
  };

  const handleJobDescriptionChange = (value: string): void => {
    setJobDescription(value);
    setAnalysisError(null);

    if (currentJobApplication) {
      updateJobApplication(currentJobApplication.id, {jobDescription: value});
    } else if (currentResumeId) {
      const newApp = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        resumeId: currentResumeId,
        jobDescription: value,
        status: 'active' as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addJobApplication(newApp);
      setCurrentJobApplication(newApp.id);
    }
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.container}>
        <Text style={styles.title}>Paste Job Description</Text>
        <Text style={styles.subtitle}>
          Add the target job description to generate ATS-focused recommendations.
        </Text>

        <View style={styles.headerRow}>
          <Text style={styles.counterText}>{jobDescription.length} chars</Text>
          {jobDescription ? (
            <AppButton
              mode="text"
              onPress={() => {
                setJobDescription('');
                setAnalysisError(null);
                if (currentJobApplication) {
                  updateJobApplication(currentJobApplication.id, {jobDescription: ''});
                }
              }}>
              Clear
            </AppButton>
          ) : null}
        </View>

        <AppTextInput
          multiline
          value={jobDescription}
          onChangeText={handleJobDescriptionChange}
          placeholder="Paste full job description here..."
          numberOfLines={12}
          style={styles.input}
          autoFocus={false}
          autoCapitalize="sentences"
          autoCorrect={true}
        />

        {jobDescription && !validation.valid ? (
          <Text style={styles.validation}>{validation.message}</Text>
        ) : null}

        {!jobDescription ? (
          <Text style={styles.helper}>Paste a full job description, including responsibilities, qualifications, and preferred skills.</Text>
        ) : null}

        {analysisError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Analysis Failed</Text>
            <Text style={styles.error}>{analysisError}</Text>
            <View style={styles.errorActions}>
              <AppButton mode="contained" onPress={handleAnalyze}>
                Try Again
              </AppButton>
              <AppButton mode="outlined" onPress={() => setAnalysisError(null)}>
                Edit Job Description
              </AppButton>
            </View>
          </View>
        ) : null}

        <PrimaryButton
          label={isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
          onPress={async () => {
            await handleAnalyze();
          }}
          loading={isAnalyzing}
          disabled={!enabled}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  headerRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterText: {
    fontSize: 12,
    color: '#64748B',
  },
  input: {
    backgroundColor: '#FFFFFF',
    minHeight: 260,
  },
  inputContent: {
    minHeight: 260,
    paddingTop: 12,
    paddingBottom: 12,
  },
  validation: {
    fontSize: 13,
    color: '#B91C1C',
    lineHeight: 20,
  },
  helper: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  error: {
    fontSize: 13,
    color: '#B91C1C',
    lineHeight: 20,
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  errorRow: {
    gap: 8,
    alignItems: 'center',
  },
});
