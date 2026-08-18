import React from 'react';
import {Alert, Clipboard, StyleSheet, Text, View} from 'react-native';
import {Button, Card, Chip} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {ROUTES} from '../constants/routes';
import {useResumeStore} from '../store/useResumeStore';

export const FinalResumeOutputScreen = (): React.JSX.Element => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        AppStackParamList,
        typeof ROUTES.FINAL_RESUME_OUTPUT
      >
    >();
  const finalResumeOutput = useResumeStore(state => state.finalResumeOutput);

  const handleCopy = (text: string, successMessage: string): void => {
    if (!text.trim()) {
      return;
    }

    Clipboard.setString(text);
    Alert.alert('Copied', successMessage);
  };

  if (!finalResumeOutput) {
    return (
      <ScreenContainer>
        <View style={styles.emptyWrapper}>
          <Text style={styles.emptyTitle}>No final output available yet.</Text>
          <Text style={styles.emptyBody}>
            Go back to Analysis Result and generate your polished final output.
          </Text>
          <Button mode="contained" onPress={() => navigation.goBack()}>
            Back to Analysis
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  const combinedText = [
    'Refined Summary',
    finalResumeOutput.refinedSummary,
    '',
    'Prioritized Keywords',
    finalResumeOutput.prioritizedKeywords.map(keyword => `- ${keyword}`).join('\n'),
    '',
    'Experience Sections',
    finalResumeOutput.polishedExperienceSections
      .map(
        section =>
          `${section.heading}\n${section.polishedSummary}\n${section.polishedBullets
            .map(bullet => `- ${bullet}`)
            .join('\n')}`,
      )
      .join('\n\n'),
    '',
    'Final Recommendations',
    finalResumeOutput.finalRecommendations.map(item => `- ${item}`).join('\n'),
    '',
    'Cautions',
    finalResumeOutput.cautions.map(item => `- ${item}`).join('\n'),
  ].join('\n');

  return (
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
        <Card style={styles.card}>
          <Card.Title title="Refined Summary" />
          <Card.Content>
            <Text style={styles.summary}>{finalResumeOutput.refinedSummary}</Text>
            <Button
              mode="text"
              style={styles.copyButton}
              onPress={() =>
                handleCopy(
                  finalResumeOutput.refinedSummary,
                  'Refined summary copied to clipboard.',
                )
              }>
              Copy summary
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Prioritized Keywords" />
          <Card.Content style={styles.chipsRow}>
            {finalResumeOutput.prioritizedKeywords.map(keyword => (
              <Chip key={keyword} compact>
                {keyword}
              </Chip>
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Polished Experience Sections" />
          <Card.Content style={styles.sectionList}>
            {finalResumeOutput.polishedExperienceSections.map(section => (
              <View key={section.heading} style={styles.sectionBlock}>
                <Text style={styles.sectionHeading}>{section.heading}</Text>
                <Text style={styles.sectionSummary}>{section.polishedSummary}</Text>
                {section.polishedBullets.map((bullet, index) => (
                  <Text key={`${section.heading}-${index}`} style={styles.bulletText}>
                    • {bullet}
                  </Text>
                ))}
              </View>
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Final Recommendations" />
          <Card.Content>
            {finalResumeOutput.finalRecommendations.map((item, index) => (
              <Text key={`${item}-${index}`} style={styles.bulletText}>
                • {item}
              </Text>
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Cautions" />
          <Card.Content>
            {finalResumeOutput.cautions.length ? (
              finalResumeOutput.cautions.map((item, index) => (
                <Text key={`${item}-${index}`} style={styles.cautionText}>
                  • {item}
                </Text>
              ))
            ) : (
              <Text style={styles.emptyBody}>No cautions were returned.</Text>
            )}
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={() =>
            handleCopy(combinedText, 'Full final output package copied to clipboard.')
          }>
          Copy full package
        </Button>
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
  summary: {
    fontSize: 14,
    lineHeight: 22,
    color: '#334155',
  },
  copyButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionList: {
    gap: 10,
  },
  sectionBlock: {
    paddingVertical: 6,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionSummary: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 6,
  },
  bulletText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  cautionText: {
    fontSize: 13,
    color: '#9A3412',
    lineHeight: 20,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 20,
    color: '#0F172A',
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
  },
});
