import React, {useMemo} from 'react';
import {Alert, Clipboard, StyleSheet, Text, View} from 'react-native';
import {Button, Card, Chip, Divider} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {ROUTES} from '../constants/routes';
import {runFinalOutputGeneration} from '../services/ai/analyzeResumeUseCase';
import {useResumeStore} from '../store/useResumeStore';

const EMPTY_RESULT = {
  matchScore: 0,
  missingKeywords: [],
  suggestedSummary: 'No analysis available yet.',
  suggestedSkills: [],
  experienceImprovements: [],
  atsTips: [],
};

export const AnalysisResultScreen = (): React.JSX.Element => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<AppStackParamList, typeof ROUTES.ANALYSIS_RESULT>
    >();
  const result = useResumeStore(state => state.analysisResult);
  const professionalExperiences = useResumeStore(state => state.professionalExperiences);
  const isGeneratingFinalOutput = useResumeStore(
    state => state.isGeneratingFinalOutput,
  );
  const finalOutputError = useResumeStore(state => state.finalOutputError);

  const viewModel = useMemo(() => {
    if (result) {
      return {
        matchScore: Math.max(0, Math.min(100, result.matchScore ?? 0)),
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

  const handleGenerateFinalOutput = async (): Promise<void> => {
    const previousFinalOutputId =
      useResumeStore.getState().finalResumeOutput?.id ?? null;

    await runFinalOutputGeneration();

    const nextState = useResumeStore.getState();
    const nextFinalOutputId = nextState.finalResumeOutput?.id ?? null;

    if (
      !nextState.finalOutputError &&
      nextFinalOutputId &&
      nextFinalOutputId !== previousFinalOutputId
    ) {
      navigation.navigate(ROUTES.FINAL_RESUME_OUTPUT);
    }
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
        <Card style={styles.card}>
          <Card.Title title="ATS Match Score" />
          <Card.Content>
            <Text style={styles.score}>{viewModel.matchScore}%</Text>
            <Button
              mode="contained"
              style={styles.finalOutputButton}
              loading={isGeneratingFinalOutput}
              disabled={isGeneratingFinalOutput || !result}
              onPress={async () => {
                await handleGenerateFinalOutput();
              }}>
              {isGeneratingFinalOutput
                ? 'Generating Final Output...'
                : 'Generate Final Resume Output'}
            </Button>
            {finalOutputError ? (
              <Text style={styles.finalOutputError}>{finalOutputError}</Text>
            ) : null}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Missing Keywords" />
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

        <Divider />

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
          <Card.Title title="Professional Experience Recommendations" />
          <Card.Content style={styles.listContainer}>
            {professionalExperiences.length ? (
              professionalExperiences.map(experience => (
                <View key={experience.id} style={styles.improvementBlock}>
                  <Text style={styles.roleHeader}>{experience.jobTitle} · {experience.company}</Text>
                  <Text style={styles.label}>Updated summary</Text>
                  <Text style={styles.bodyText}>{experience.summary || 'No summary available yet.'}</Text>
                  {experience.keywords.length ? (
                    <View style={styles.chipsRow}>
                      {experience.keywords.map(keyword => (
                        <Chip key={`${experience.id}-${keyword}`} compact>{keyword}</Chip>
                      ))}
                    </View>
                  ) : null}
                  {experience.generatedSuggestions.length ? (
                    <>
                      <Text style={styles.label}>Suggestions</Text>
                      {experience.generatedSuggestions.map((suggestion, index) => (
                        <Text key={`${experience.id}-suggestion-${index}`} style={styles.tipText}>• {suggestion}</Text>
                      ))}
                    </>
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Add roles in the professional experience editor to see tailored recommendations.</Text>
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
  finalOutputButton: {
    marginTop: 14,
    alignSelf: 'flex-start',
  },
  finalOutputError: {
    marginTop: 10,
    fontSize: 13,
    color: '#B91C1C',
    lineHeight: 20,
  },
});
