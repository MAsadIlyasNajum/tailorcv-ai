import React, {useMemo, useState} from 'react';
import {Alert, Clipboard, StyleSheet, Text, View} from 'react-native';
import {Button, Card, Chip} from 'react-native-paper';

import {ScreenContainer} from '../components/common/ScreenContainer';
import {useResumeStore} from '../store/useResumeStore';

const EMPTY_RESULT = {
  matchScore: 0,
  matchingKeywords: [],
  missingKeywords: [],
  suggestedSummary: 'No analysis available yet.',
  suggestedSkills: [],
  experienceImprovements: [],
  atsTips: [],
};

export const AnalysisResultScreen = (): React.JSX.Element => {
  const result = useResumeStore(state => state.analysisResult);
  const usefulnessFeedback = useResumeStore(state => state.usefulnessFeedback);
  const setUsefulnessFeedback = useResumeStore(state => state.setUsefulnessFeedback);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const viewModel = useMemo(() => {
    if (result) {
      return {
        matchScore: Math.max(0, Math.min(100, result.matchScore ?? 0)),
        matchingKeywords: result.matchingKeywords ?? [],
        missingKeywords: result.missingKeywords ?? [],
        suggestedSummary: result.suggestedSummary ?? 'No summary available.',
        suggestedSkills: result.suggestedSkills ?? [],
        experienceImprovements: result.experienceImprovements ?? [],
        atsTips: result.atsTips ?? [],
      };
    }

    return EMPTY_RESULT;
  }, [result]);

  const handleCopy = (): void => {
    if (!result?.suggestedSummary) {
      return;
    }

    Clipboard.setString(result.suggestedSummary);
    Alert.alert('Copied', 'Suggested summary copied to clipboard.');
  };

  const handleUsefulness = (value: 'yes' | 'no'): void => {
    setUsefulnessFeedback(value);
    setFeedbackSubmitted(true);
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
        <Card style={styles.card}>
          <Card.Title title="ATS Match Score" subtitle="ATS = Applicant Tracking System — the software recruiters use to filter resumes" />
          <Card.Content>
            <Text style={styles.score}>{viewModel.matchScore}%</Text>
            <Text style={styles.scoreExplanation}>
              This is an AI-estimated match based on how closely your resume
              aligns with this job description. Use it as a rough guide, not a
              precise measure.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="What matches" />
          <Card.Content style={styles.chipsRow}>
            {viewModel.matchingKeywords.length ? (
              viewModel.matchingKeywords.map(keyword => (
                <Chip key={keyword} compact>
                  {keyword}
                </Chip>
              ))
            ) : (
              <Text style={styles.emptyText}>No matching keywords identified.</Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="What you're missing" />
          <Card.Content style={styles.chipsRow}>
            {viewModel.missingKeywords.length ? (
              viewModel.missingKeywords.map(keyword => (
                <Chip key={keyword} compact>
                  {keyword}
                </Chip>
              ))
            ) : (
              <Text style={styles.emptyText}>No missing keywords identified.</Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Suggested Summary" />
          <Card.Content>
            <Text style={styles.summary}>{viewModel.suggestedSummary}</Text>
            {result?.suggestedSummary ? (
              <Button mode="text" onPress={handleCopy} style={styles.copyButton}>
                Copy
              </Button>
            ) : null}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Suggested Skills" />
          <Card.Content style={styles.chipsRow}>
            {viewModel.suggestedSkills.length ? (
              viewModel.suggestedSkills.map(skill => (
                <Chip key={skill}>{skill}</Chip>
              ))
            ) : (
              <Text style={styles.emptyText}>No recommended skills available.</Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Experience Improvements" />
          <Card.Content style={styles.listContainer}>
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
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="ATS Tips" />
          <Card.Content style={styles.listContainer}>
            {viewModel.atsTips.length ? (
              viewModel.atsTips.map((tip, index) => (
                <Text key={`${tip}-${index}`} style={styles.tipText}>• {tip}</Text>
              ))
            ) : (
              <Text style={styles.emptyText}>No ATS tips available.</Text>
            )}
          </Card.Content>
        </Card>

        {result ? (
          <Card style={styles.card}>
            <Card.Title title="Was this analysis helpful?" />
            <Card.Content style={styles.feedbackRow}>
              {usefulnessFeedback || feedbackSubmitted ? (
                <Text style={styles.feedbackConfirmed}>Thanks for your feedback.</Text>
              ) : (
                <>
                  <Button
                    mode="contained"
                    onPress={() => handleUsefulness('yes')}
                    style={styles.feedbackButton}>
                    {'\u{1F44D}'} Yes
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => handleUsefulness('no')}
                    style={styles.feedbackButton}>
                    {'\u{1F44E}'} No
                  </Button>
                </>
              )}
            </Card.Content>
          </Card>
        ) : null}
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
});
