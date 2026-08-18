import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Button, TextInput} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ROUTES} from '../constants/routes';
import {runResumeAnalysis} from '../services/ai/analyzeResumeUseCase';
import {useResumeStore} from '../store/useResumeStore';
import {validateJobDescription} from '../utils/validation/jobDescriptionValidation';

export const JobDescriptionScreen = (): React.JSX.Element => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, typeof ROUTES.JOB_DESCRIPTION>>();
  const resumeText = useResumeStore(state => state.resumeText);
  const jobDescription = useResumeStore(state => state.jobDescription);
  const isAnalyzing = useResumeStore(state => state.isAnalyzing);
  const analysisError = useResumeStore(state => state.analysisError);
  const setJobDescription = useResumeStore(state => state.setJobDescription);
  const setAnalysisError = useResumeStore(state => state.setAnalysisError);

  const [isFocused, setIsFocused] = useState(false);

  const validation = useMemo(
    () => validateJobDescription(jobDescription),
    [jobDescription],
  );

  const enabled = Boolean(resumeText.trim()) && validation.valid && !isAnalyzing;

  const handleAnalyze = async (): Promise<void> => {
    if (!enabled) {
      return;
    }

    const previousResultId = useResumeStore.getState().analysisResult?.id ?? null;

    await runResumeAnalysis();

    const nextState = useResumeStore.getState();
    const nextResultId = nextState.analysisResult?.id ?? null;

    if (!nextState.analysisError && nextResultId && nextResultId !== previousResultId) {
      navigation.navigate(ROUTES.ANALYSIS_RESULT);
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
            <Button
              mode="text"
              onPress={() => {
                setJobDescription('');
                setAnalysisError(null);
              }}>
              Clear
            </Button>
          ) : null}
        </View>

        <TextInput
          mode="outlined"
          multiline
          value={jobDescription}
          onChangeText={value => {
            setJobDescription(value);
            setAnalysisError(null);
          }}
          placeholder="Paste full job description here..."
          numberOfLines={12}
          style={styles.input}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="sentences"
          autoCorrect={true}
          textAlignVertical="top"
          contentStyle={styles.inputContent}
        />

        {jobDescription && !validation.valid ? (
          <Text style={styles.validation}>{validation.message}</Text>
        ) : null}

        {!jobDescription && !isFocused ? (
          <Text style={styles.helper}>Paste a full job description, including responsibilities, qualifications, and preferred skills.</Text>
        ) : null}

        {analysisError ? <Text style={styles.error}>{analysisError}</Text> : null}

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
});
