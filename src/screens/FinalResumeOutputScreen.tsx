import React, {useState} from 'react';
import {Alert, Clipboard, Share, StyleSheet, Text, View} from 'react-native';
import {AppButton, AppCard, AppChip, EmptyState, InfoBanner} from '../components';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {PrimaryButton} from '../components/common/PrimaryButton';
import {ROUTES} from '../constants/routes';
import {useResumeStore} from '../store/useResumeStore';
import {trackEvent} from '../services/analytics/analytics';
import {exportFinalResumeToPdf, sharePdf} from '../services/pdf/pdfGenerator';
import {colors, typography, spacing, borderRadius, shadows} from '../app/theme/designTokens';

export const FinalResumeOutputScreen = (): React.JSX.Element => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        AppStackParamList,
        typeof ROUTES.FINAL_RESUME_OUTPUT
      >
    >();
  const finalResumeOutput = useResumeStore(state => state.finalResumeOutput);
  const analysisResults = useResumeStore(state => state.analysisResults);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleCopy = (text: string, successMessage: string): void => {
    if (!text.trim()) {
      return;
    }

    Clipboard.setString(text);
    Alert.alert('Copied', successMessage);
  };

  const handleShare = async (): Promise<void> => {
    if (!finalResumeOutput) {
      return;
    }

    const message = [
      'Refined Summary',
      finalResumeOutput.refinedSummary,
      '',
      'Prioritized Keywords',
      finalResumeOutput.prioritizedKeywords.join(', '),
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
    ].join('\n');

    try {
      await Share.share({message, title: 'TailorCV AI - Final Resume'});
      trackEvent('final_resume_shared');
    } catch {
      // share cancelled or failed silently
    }
  };

  const analysis = analysisResults.find(r => r.id === finalResumeOutput?.analysisId);

  const handleExportPdf = async (): Promise<void> => {
    if (!finalResumeOutput) {
      return;
    }

    setIsExportingPdf(true);
    try {
      const result = await exportFinalResumeToPdf(
        finalResumeOutput,
        analysis?.companyName,
        analysis?.jobTitle,
      );
      trackEvent('pdf_exported');
      await sharePdf(result.filePath);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not generate PDF.';
      Alert.alert(
        'PDF Export Failed',
        `${message} You can copy the text instead.`,
        [
          {text: 'OK'},
          {
            text: 'Copy Text',
            onPress: () => handleCopy(combinedText, 'Full final output copied to clipboard.'),
          },
        ],
      );
      trackEvent('pdf_export_failed');
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (!finalResumeOutput) {
    return (
      <ScreenContainer>
        <EmptyState
          title="No final output available yet."
          description="Go back to Analysis Result and generate your polished final output."
          action={
            <PrimaryButton label="Back to Analysis" onPress={() => navigation.goBack()} />
          }
        />
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
        <InfoBanner
          title="Final Resume Output"
          message="Refined summary, prioritized keywords, and polished experience sections ready to export or share."
          tone="primary"
        />

        <AppCard style={styles.card}>
          <AppCard.Title title="Refined Summary" />
          <AppCard.Content>
            <Text style={styles.summary}>{finalResumeOutput.refinedSummary}</Text>
            <AppButton
              mode="text"
              style={styles.copyButton}
              onPress={() =>
                handleCopy(
                  finalResumeOutput.refinedSummary,
                  'Refined summary copied to clipboard.',
                )
              }>
              Copy summary
            </AppButton>
          </AppCard.Content>
        </AppCard>

        <AppCard style={styles.card}>
          <AppCard.Title title="Prioritized Keywords" />
          <AppCard.Content style={styles.chipsRow}>
            {finalResumeOutput.prioritizedKeywords.map(keyword => (
              <AppChip key={keyword} compact>
                {keyword}
              </AppChip>
            ))}
          </AppCard.Content>
        </AppCard>

        <AppCard style={styles.card}>
          <AppCard.Title title="Polished Experience Sections" />
          <AppCard.Content style={styles.sectionList}>
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
          </AppCard.Content>
        </AppCard>

        <AppCard style={styles.card}>
          <AppCard.Title title="Final Recommendations" />
          <AppCard.Content>
            {finalResumeOutput.finalRecommendations.map((item, index) => (
              <Text key={`${item}-${index}`} style={styles.bulletText}>
                • {item}
              </Text>
            ))}
          </AppCard.Content>
        </AppCard>

        <AppCard style={styles.card}>
          <AppCard.Title title="Cautions" />
          <AppCard.Content>
            {finalResumeOutput.cautions.length ? (
              finalResumeOutput.cautions.map((item, index) => (
                <Text key={`${item}-${index}`} style={styles.cautionText}>
                  • {item}
                </Text>
              ))
            ) : (
              <Text style={styles.emptyBody}>No cautions were returned.</Text>
            )}
          </AppCard.Content>
        </AppCard>

        <View style={styles.stickyActions}>
          <View style={styles.buttonRow}>
            <PrimaryButton
              label="Export PDF"
              onPress={handleExportPdf}
              loading={isExportingPdf}
              disabled={isExportingPdf}
              fullWidth={false}
            />
            <PrimaryButton
              label="Share"
              onPress={handleShare}
              fullWidth={false}
            />
          </View>
          <AppButton
            mode="contained"
            onPress={() =>
              handleCopy(combinedText, 'Full final output package copied to clipboard.')
            }>
            Copy full package
          </AppButton>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.md,
  },
  card: {
    borderRadius: borderRadius.lg,
    ...shadows.card,
  },
  summary: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  copyButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sectionList: {
    gap: spacing.sm,
  },
  sectionBlock: {
    paddingVertical: 6,
  },
  sectionHeading: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionSummary: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  bulletText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  cautionText: {
    ...typography.body,
    lineHeight: 20,
    color: '#9A3412',
  },
  emptyBody: {
    ...typography.body,
    color: colors.textTertiary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  stickyActions: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    ...shadows.card,
  },
});
