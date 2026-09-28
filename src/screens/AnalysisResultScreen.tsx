import React, {useMemo, useState} from 'react';
import {Alert, Clipboard, Share, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton, AppCard, AppChip, InfoBanner, StickyActionBar} from '../components';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp, NativeStackScreenProps} from '@react-navigation/native-stack';

import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScoreIndicator} from '../components/ats/ScoreIndicator';
import {useResumeStore} from '../store/useResumeStore';
import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ROUTES} from '../constants/routes';
import {trackEvent} from '../services/analytics/analytics';
import {runFinalOutputGeneration} from '../services/ai/analyzeResumeUseCase';
import {calculateWeightedKeywordCoverage} from '../utils/validation/keywordCoverage';
import {calculateAtsAnalysis} from '../services/ats/atsAnalysis';
import {colors, spacing, typography, borderRadius, shadows} from '../app/theme/designTokens';

type Props = NativeStackScreenProps<AppStackParamList, typeof ROUTES.ANALYSIS_RESULT>;

export const AnalysisResultScreen = ({route}: Props): React.JSX.Element => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const analysisResults = useResumeStore(state => state.analysisResults);
  const currentAnalysisId = useResumeStore(state => state.currentAnalysisId);
  const usefulnessFeedback = useResumeStore(state => state.usefulnessFeedback);
  const setUsefulnessFeedback = useResumeStore(state => state.setUsefulnessFeedback);
  const finalResumeOutput = useResumeStore(state => state.finalResumeOutput);
  const isGeneratingFinalOutput = useResumeStore(state => state.isGeneratingFinalOutput);
  const finalOutputError = useResumeStore(state => state.finalOutputError);
  const setFinalOutputError = useResumeStore(state => state.setFinalOutputError);
  const resumes = useResumeStore(state => state.resumes);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const analysisId = route?.params?.analysisId ?? currentAnalysisId;
  const result = useMemo(
    () => analysisResults.find(r => r.id === analysisId) ?? null,
    [analysisResults, analysisId],
  );

  const resume = useMemo(
    () => resumes.find(r => r.id === result?.resumeId) ?? null,
    [resumes, result?.resumeId],
  );

  const atsAnalysis = useMemo(() => {
    if (!result || !resume?.content) {
      return null;
    }
    return calculateAtsAnalysis(resume.content, result);
  }, [result, resume?.content]);

  const keywordCoverage = useMemo(() => {
    if (!result) {
      return null;
    }
    return calculateWeightedKeywordCoverage(
      result.matchingKeywords,
      result.missingKeywords,
    );
  }, [result]);

  const viewModel = useMemo(() => {
    if (result) {
      return {
        matchScore: Math.max(0, Math.min(100, result.matchScore ?? 0)),
        matchingKeywords: (result.matchingKeywords ?? []).map(k => typeof k === 'string' ? k : k.term),
        missingKeywords: (result.missingKeywords ?? []).map(k => typeof k === 'string' ? k : k.term),
        suggestedSummary: result.suggestedSummary ?? 'No summary available.',
        suggestedSkills: result.suggestedSkills ?? [],
        experienceImprovements: result.experienceImprovements ?? [],
        atsTips: result.atsTips ?? [],
      };
    }

    return {
      matchScore: 0,
      matchingKeywords: [],
      missingKeywords: [],
      suggestedSummary: 'No analysis available yet.',
      suggestedSkills: [],
      experienceImprovements: [],
      atsTips: [],
    };
  }, [result]);

  const buildFullAnalysisText = (): string => {
    return [
      `Resume Match: ${viewModel.matchScore}%`,
      `Keyword Coverage: ${keywordCoverage ?? 0}%`,
      '',
      'Matching Keywords:',
      ...viewModel.matchingKeywords.map(k => `- ${k}`),
      '',
      'Missing Keywords:',
      ...viewModel.missingKeywords.map(k => `- ${k}`),
      '',
      'Suggested Summary:',
      viewModel.suggestedSummary,
      '',
      'Suggested Skills:',
      ...viewModel.suggestedSkills.map(s => `- ${s}`),
      '',
      'Experience Improvements:',
      ...viewModel.experienceImprovements.map(
        item => `- Original: ${item.original}\n  Improved: ${item.improved}`,
      ),
      '',
      'ATS Tips:',
      ...viewModel.atsTips.map(tip => `- ${tip}`),
    ].join('\n');
  };

  const handleCopy = (text: string, label: string): void => {
    Clipboard.setString(text);
    Alert.alert('Copied', `${label} copied to clipboard.`);
    trackEvent('result_copied', {section: label});
  };

  const handleCopyFull = (): void => {
    handleCopy(buildFullAnalysisText(), 'Full analysis');
  };

  const handleShare = async (): Promise<void> => {
    if (!result) {
      return;
    }

    try {
      await Share.share({message: buildFullAnalysisText(), title: 'TailorCV AI Analysis'});
      trackEvent('result_shared');
    } catch {
      // share cancelled or failed silently
    }
  };

  const handleUsefulness = (value: 'yes' | 'no'): void => {
    setUsefulnessFeedback(value);
    setFeedbackSubmitted(true);
  };

  const handleGenerateFinalOutput = async (): Promise<void> => {
    setFinalOutputError(null);
    await runFinalOutputGeneration();
    const store = useResumeStore.getState();
    if (store.finalResumeOutput) {
      trackEvent('final_output_generated');
      navigation.navigate(ROUTES.FINAL_RESUME_OUTPUT);
    }
  };

  const handleRetryFinalOutput = (): void => {
    setFinalOutputError(null);
    handleGenerateFinalOutput();
  };

  const hasFinalOutput = finalResumeOutput?.analysisId === result?.id;

  const targetLabel = result?.jobTitle ? `${result.jobTitle} @ ${result.companyName ?? '…'}` : result?.companyName ?? 'Target role';

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.flex}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <InfoBanner
            icon="✦"
            title={`Match Score: ${viewModel.matchScore}%`}
            message={`${viewModel.matchScore}% aligned with ${targetLabel} · ${keywordCoverage ?? 0}% keyword coverage${viewModel.matchScore >= 60 ? ' · Passes typical ATS screening' : ''}`}
            tone="primaryLighter"
          />

          <AppCard style={styles.card}>
            <AppCard.Title title="Resume Match" subtitle="AI-estimated alignment with this job description" />
            <AppCard.Content>
              <ScoreIndicator
                score={viewModel.matchScore}
                breakdown={atsAnalysis?.scoreBreakdown}
                showBreakdown={!!atsAnalysis}
                size="large"
              />
              {keywordCoverage !== null ? (
                <Text style={styles.coverageText}>Keyword Coverage: {keywordCoverage}%</Text>
              ) : null}
              <Text style={styles.scoreExplanation}>
                Keyword coverage is weighted by importance in the job description.
              </Text>
            </AppCard.Content>
          </AppCard>

          <AppCard style={styles.card}>
            <AppCard.Title title="What matches" />
            <AppCard.Content style={styles.chipsRow}>
              {viewModel.matchingKeywords.length ? (
                viewModel.matchingKeywords.map(keyword => (
                  <AppChip key={keyword} compact tone="success">
                    {keyword}
                  </AppChip>
                ))
              ) : (
                <Text style={styles.emptyText}>No matching keywords identified.</Text>
              )}
            </AppCard.Content>
          </AppCard>

          <AppCard style={styles.card}>
            <AppCard.Title title="What you're missing" />
            <AppCard.Content style={styles.chipsRow}>
              {viewModel.missingKeywords.length ? (
                viewModel.missingKeywords.map(keyword => (
                  <AppChip key={keyword} compact tone="danger">
                    {keyword}
                  </AppChip>
                ))
              ) : (
                <Text style={styles.emptyText}>No missing keywords identified.</Text>
              )}
            </AppCard.Content>
          </AppCard>

          <AppCard style={styles.card}>
            <AppCard.Title title="Suggested Summary" />
            <AppCard.Content>
              <Text style={styles.summary}>{viewModel.suggestedSummary}</Text>
              {result?.suggestedSummary ? (
                <AppButton mode="text" onPress={() => handleCopy(viewModel.suggestedSummary, 'Suggested summary')} style={styles.copyButton}>
                  Copy
                </AppButton>
              ) : null}
            </AppCard.Content>
          </AppCard>

          <AppCard style={styles.card}>
            <AppCard.Title title="Suggested Skills" />
            <AppCard.Content style={styles.chipsRow}>
              {viewModel.suggestedSkills.length ? (
                viewModel.suggestedSkills.map(skill => (
                  <AppChip key={skill}>{skill}</AppChip>
                ))
              ) : (
                <Text style={styles.emptyText}>No recommended skills available.</Text>
              )}
            </AppCard.Content>
            {viewModel.suggestedSkills.length ? (
              <AppButton mode="text" onPress={() => handleCopy(viewModel.suggestedSkills.join('\n'), 'Suggested skills')} style={styles.copyButton}>
                Copy all skills
              </AppButton>
            ) : null}
          </AppCard>

          <AppCard style={styles.card}>
            <AppCard.Title title="Experience Improvements" />
            <AppCard.Content style={styles.listContainer}>
              {viewModel.experienceImprovements.length ? (
                viewModel.experienceImprovements.map((item, index) => (
                  <View key={`${item.original}-${index}`} style={styles.improvementBlock}>
                    <Text style={styles.label}>Original</Text>
                    <Text style={styles.bodyText}>{item.original}</Text>
                    <Text style={styles.label}>Improved</Text>
                    <Text style={styles.bodyText}>{item.improved}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No experience improvements were generated.</Text>
              )}
            </AppCard.Content>
          </AppCard>

          <AppCard style={styles.card}>
            <AppCard.Title title="ATS Tips" />
            <AppCard.Content style={styles.listContainer}>
              {viewModel.atsTips.length ? (
                viewModel.atsTips.map((tip, index) => (
                  <Text key={`${tip}-${index}`} style={styles.tipText}>• {tip}</Text>
                ))
              ) : (
                <Text style={styles.emptyText}>No ATS tips available.</Text>
              )}
            </AppCard.Content>
            {viewModel.atsTips.length ? (
              <AppButton mode="text" onPress={() => handleCopy(viewModel.atsTips.join('\n'), 'ATS tips')} style={styles.copyButton}>
                Copy all tips
              </AppButton>
            ) : null}
          </AppCard>

          {result ? (
            <AppCard style={styles.card}>
              <AppCard.Title title="Was this analysis helpful?" />
              <AppCard.Content style={styles.feedbackRow}>
                {usefulnessFeedback || feedbackSubmitted ? (
                  <Text style={styles.feedbackConfirmed}>Thanks for your feedback.</Text>
                ) : (
                  <>
                    <AppButton
                      mode="contained"
                      onPress={() => handleUsefulness('yes')}
                      style={styles.feedbackButton}>
                      {'\u{1F44D}'} Yes
                    </AppButton>
                    <AppButton
                      mode="outlined"
                      onPress={() => handleUsefulness('no')}
                      style={styles.feedbackButton}>
                      {'\u{1F44E}'} No
                    </AppButton>
                  </>
                )}
              </AppCard.Content>
            </AppCard>
          ) : null}

          {finalOutputError ? (
            <AppCard style={[styles.card, styles.errorCard]}>
              <AppCard.Title title="Final Output Error" />
              <AppCard.Content>
                <Text style={styles.errorText}>{finalOutputError}</Text>
                <View style={styles.errorActions}>
                  <AppButton mode="contained" onPress={handleRetryFinalOutput}>
                    Try Again
                  </AppButton>
                  <AppButton mode="outlined" onPress={() => navigation.goBack()}>
                    Back to Analysis
                  </AppButton>
                </View>
              </AppCard.Content>
            </AppCard>
          ) : null}
        </ScrollView>

        <View style={styles.stickyFooter}>
          <StickyActionBar>
            <View style={styles.footerColumn}>
              <View style={styles.footerPrimary}>
                {resume?.content ? (
                  <View style={styles.footerPrimaryItem}>
                    <PrimaryButton
                      label="Optimize Resume"
                      onPress={() => navigation.navigate(ROUTES.RESUME_EDITOR as never, {resumeId: resume.id} as never)}
                    />
                  </View>
                ) : null}
                <View style={styles.footerPrimaryItem}>
                  <PrimaryButton
                    label="Edit Suggestions"
                    onPress={() => navigation.navigate(ROUTES.EDIT_SUGGESTIONS as never, {analysisId: result?.id} as never)}
                  />
                </View>
                {hasFinalOutput ? (
                  <View style={styles.footerPrimaryItem}>
                    <PrimaryButton
                      label="View Final Resume"
                      onPress={() => navigation.navigate(ROUTES.FINAL_RESUME_OUTPUT as never)}
                    />
                  </View>
                ) : (
                  <View style={styles.footerPrimaryItem}>
                    <PrimaryButton
                      label="Generate Tailored Resume"
                      onPress={handleGenerateFinalOutput}
                      loading={isGeneratingFinalOutput}
                      disabled={isGeneratingFinalOutput}
                    />
                  </View>
                )}
              </View>
              <View style={styles.footerSecondary}>
                <AppButton
                  mode="outlined"
                  onPress={handleCopyFull}
                  fullWidth={false}
                  bgColor={colors.primaryTint}
                  textColor={colors.textPrimary}>
                  Copy
                </AppButton>
                <AppButton
                  mode="outlined"
                  onPress={handleShare}
                  fullWidth={false}
                  bgColor={colors.primaryTint}
                  textColor={colors.textPrimary}>
                  Share
                </AppButton>
              </View>
            </View>
          </StickyActionBar>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: 176,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    borderRadius: borderRadius.lg,
  },
  coverageText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  scoreExplanation: {
    marginTop: spacing.xs,
    ...typography.body,
    color: colors.textSecondary,
  },
  summary: {
    ...typography.body,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  emptyText: {
    ...typography.body,
    fontSize: 13,
    color: colors.textTertiary,
    lineHeight: 20,
  },
  label: {
    ...typography.labelSm,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  bodyText: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  listContainer: {
    gap: spacing.xs,
  },
  improvementBlock: {
    paddingVertical: 6,
  },
  tipText: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  copyButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  feedbackButton: {
    alignSelf: 'flex-start',
  },
  feedbackConfirmed: {
    ...typography.body,
    fontSize: 13,
    color: colors.green,
    fontWeight: '600',
  },
  stickyFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    ...shadows.fab,
  },
  footerColumn: {
    width: '100%',
    gap: spacing.md,
  },
  footerPrimary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  footerPrimaryItem: {
    flex: 1,
    minWidth: 120,
  },
  footerSecondary: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  errorCard: {
    borderColor: colors.red,
    borderWidth: 1,
  },
  errorTitle: {
    color: colors.redStrong,
  },
  errorText: {
    ...typography.body,
    fontSize: 14,
    color: colors.redText,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  errorActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
});
