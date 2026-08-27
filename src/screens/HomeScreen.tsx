import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Card, Divider} from 'react-native-paper';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {ROUTES} from '../constants/routes';
import {useResumeStore} from '../store/useResumeStore';
import type {AppStackParamList} from '../app/navigation/AppNavigator';

type Props = NativeStackScreenProps<AppStackParamList, typeof ROUTES.HOME>;

export const HomeScreen = ({navigation}: Props): React.JSX.Element => {
  const resumeText = useResumeStore(state => state.resumeText);
  const resumeMetadata = useResumeStore(state => state.resumeMetadata);
  const jobDescription = useResumeStore(state => state.jobDescription);
  const analysisResult = useResumeStore(state => state.analysisResult);

  const hasResume = Boolean(resumeText.trim());
  const hasJobDescription = Boolean(jobDescription.trim());
  const canAnalyze = hasResume && hasJobDescription;

  const resumeStatusLabel = useMemo(() => {
    if (!hasResume) {
      return 'No resume uploaded yet.';
    }

    if (resumeMetadata?.name) {
      return `✓ ${resumeMetadata.name}`;
    }

    return '✓ Resume text added';
  }, [hasResume, resumeMetadata?.name]);

  const latestAnalysisLabel = useMemo(() => {
    if (!analysisResult) {
      return 'No analysis yet. Upload your resume and paste a job description to get started.';
    }

    return `${analysisResult.matchScore}% Match • ${analysisResult.missingKeywords.length} missing keywords`;
  }, [analysisResult]);

  return (
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
        <Card style={styles.logoCard}>
          <Card.Content>
            <Text style={styles.logoTitle}>TailorCV AI</Text>
            <Text style={styles.logoSubtitle}>
              Tailor your resume for your next job.
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.actions}>
          <PrimaryButton
            label={hasResume ? 'Replace Resume' : 'Upload Resume'}
            onPress={() => navigation.navigate(ROUTES.UPLOAD_RESUME)}
          />

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Resume</Text>
            <Text style={[styles.statusValue, hasResume && styles.statusValueActive]}>
              {resumeStatusLabel}
            </Text>
          </View>

          <PrimaryButton
            label="Paste Job Description"
            onPress={() => navigation.navigate(ROUTES.JOB_DESCRIPTION)}
          />

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Job Description</Text>
            <Text
              style={[
                styles.statusValue,
                hasJobDescription && styles.statusValueActive,
              ]}>
              {hasJobDescription
                ? `${jobDescription.length} characters pasted`
                : 'Not pasted yet'}
            </Text>
          </View>

          <PrimaryButton
            label="Analyze Resume"
            onPress={() => navigation.navigate(ROUTES.JOB_DESCRIPTION)}
            disabled={!canAnalyze}
          />
        </View>

        <Divider style={styles.divider} />

        <Card style={styles.resultCard}>
          <Card.Title title="Latest Analysis" />
          <Card.Content>
            <Text style={styles.summaryText}>{latestAnalysisLabel}</Text>
            {analysisResult ? (
              <PrimaryButton
                label="View Results"
                onPress={() => navigation.navigate(ROUTES.ANALYSIS_RESULT)}
                fullWidth={false}
              />
            ) : null}
          </Card.Content>
        </Card>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 20,
  },
  logoCard: {
    borderRadius: 16,
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  logoSubtitle: {
    fontSize: 15,
    color: '#475569',
    marginTop: 6,
  },
  actions: {
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  statusValue: {
    fontSize: 14,
    color: '#64748B',
  },
  statusValueActive: {
    color: '#16A34A',
    fontWeight: '600',
  },
  divider: {
    marginVertical: 2,
  },
  resultCard: {
    borderRadius: 16,
  },
  summaryText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 12,
  },
});
