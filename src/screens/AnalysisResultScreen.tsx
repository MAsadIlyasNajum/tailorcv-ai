import React, {useMemo, useState} from 'react';
import {Alert, Clipboard, Share, StyleSheet, Text, View} from 'react-native';
import {AppButton, AppCard, AppChip} from '../components';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp, NativeStackScreenProps} from '@react-navigation/native-stack';

import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {ScoreIndicator} from '../components/ats/ScoreIndicator';
import {useResumeStore} from '../store/useResumeStore';
import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ROUTES} from '../constants/routes';
import {trackEvent} from '../services/analytics/analytics';
import {runFinalOutputGeneration} from '../services/ai/analyzeResumeUseCase';
import {calculateWeightedKeywordCoverage} from '../utils/validation/keywordCoverage';
import {calculateAtsAnalysis} from '../services/ats/atsAnalysis';

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

  const handleCopy = (text: string, label: string): void => {
    Clipboard.setString(text);
    Alert.alert('Copied', `${label} copied to clipboard.`);
    trackEvent('result_copied', {section: label});
  };

  const handleShare = async (): Promise<void> => {
    if (!result) {
      return;
    }

    const message = [
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
    ]
      .join('\n');

    try {
      await Share.share({message, title: 'TailorCV AI Analysis'});
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

  return (
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
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
                <AppChip key={keyword} compact>
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
                <AppChip key={keyword} compact>
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

        <View style={styles.footerActions}>
          {resume?.content ? (
            <PrimaryButton
              label="Optimize Resume"
              onPress={() => navigation.navigate(ROUTES.RESUME_EDITOR as never, {resumeId: resume.id} as never)}
            />
          ) : null}
          <PrimaryButton label="Edit Suggestions" onPress={() => navigation.navigate(ROUTES.EDIT_SUGGESTIONS, {analysisId: result?.id})} />
          {hasFinalOutput ? (
            <PrimaryButton
              label="View Final Resume"
              onPress={() => navigation.navigate(ROUTES.FINAL_RESUME_OUTPUT)}
            />
          ) : (
            <PrimaryButton
              label="Generate Tailored Resume"
              onPress={handleGenerateFinalOutput}
              loading={isGeneratingFinalOutput}
              disabled={isGeneratingFinalOutput}
            />
          )}
          <View style={styles.footerSecondary}>
            <AppButton mode="outlined" onPress={() => handleCopy([
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
            ].join('\n'), 'Full analysis')}>
              Copy
            </AppButton>
            <AppButton mode="outlined" onPress={handleShare}>
              Share
            </AppButton>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 14,
  },
  card: {
    borderRadius: 16,
  },
  score: {
    fontSize: 44,
    color: '#2563EB',
    fontWeight: '700',
  },
  coverageText: {
    fontSize: 16,
    color: '#475569',
    marginTop: 4,
    fontWeight: '600',
  },
  scoreExplanation: {
    marginTop: 6,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  summary: {
    fontSize: 14,
    lineHeight: 22,
    color: '#334155',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  label: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 10,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
    marginTop: 4,
  },
  listContainer: {
    gap: 8,
  },
  improvementBlock: {
    paddingVertical: 6,
  },
  roleHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
  },
  copyButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  feedbackButton: {
    alignSelf: 'flex-start',
  },
  feedbackConfirmed: {
    fontSize: 13,
    color: '#14B8A6',
    fontWeight: '600',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  footerSecondary: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  errorCard: {
    borderColor: '#DC2626',
    borderWidth: 1,
  },
  errorTitle: {
    color: '#DC2626',
  },
  errorText: {
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 20,
    marginBottom: 12,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
});
