import React, {useMemo} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp, NativeStackScreenProps} from '@react-navigation/native-stack';

import {AppCard, AppChip, InfoBanner, PrimaryButton, StickyActionBar, StickyActionButton} from '../components';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {useResumeStore} from '../store/useResumeStore';
import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ROUTES} from '../constants/routes';
import {colors, typography, spacing, borderRadius, shadows} from '../app/theme/designTokens';

type Props = NativeStackScreenProps<AppStackParamList, typeof ROUTES.JOB_APPLICATION_DETAIL>;

const formatTimestamp = (timestamp: number): string => new Date(timestamp).toLocaleString();

export const JobApplicationDetailScreen = ({route}: Props): React.JSX.Element => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const {jobApplicationId} = route.params;
  const jobApplications = useResumeStore(state => state.jobApplications);
  const analysisResults = useResumeStore(state => state.analysisResults);
  const resumes = useResumeStore(state => state.resumes);

  const application = useMemo(
    () => jobApplications.find(a => a.id === jobApplicationId) ?? null,
    [jobApplications, jobApplicationId],
  );

  const relatedAnalysis = useMemo(
    () => analysisResults.find(a => a.jobApplicationId === jobApplicationId) ?? null,
    [analysisResults, jobApplicationId],
  );

  const resume = useMemo(
    () => (relatedAnalysis ? resumes.find(r => r.id === relatedAnalysis.resumeId) : null),
    [resumes, relatedAnalysis],
  );

  const matchingKeywords = useMemo(
    () => (relatedAnalysis?.matchingKeywords ?? []).map(keyword =>
      typeof keyword === 'string' ? keyword : keyword.term,
    ),
    [relatedAnalysis?.matchingKeywords],
  );

  const missingKeywords = useMemo(
    () => (relatedAnalysis?.missingKeywords ?? []).map(keyword =>
      typeof keyword === 'string' ? keyword : keyword.term,
    ),
    [relatedAnalysis?.missingKeywords],
  );

  if (!application) {
    return (
      <ScreenContainer>
        <View style={styles.notFoundContainer}>
          <InfoBanner
            icon="!"
            title="Application not found"
            message="This job application is no longer available on this device."
            tone="neutral"
          />
          <PrimaryButton label="Back to History" onPress={() => navigation.goBack()} />
        </View>
      </ScreenContainer>
    );
  }

  const statusLabel = application.status === 'active' ? 'Active' : 'Archived';

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.heroCard}>
          <View style={styles.heroAccent} />
          <View style={styles.heroContent}>
            <Text style={styles.eyebrow}>{statusLabel.toUpperCase()}</Text>
            <Text style={styles.title}>{application.jobTitle ?? 'Untitled application'}</Text>
            <Text style={styles.company}>{application.companyName ?? 'No company specified'}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <Text style={styles.metaPillText}>Created {formatTimestamp(application.createdAt)}</Text>
              </View>
              <View style={styles.metaPill}>
                <Text style={styles.metaPillText}>Updated {formatTimestamp(application.updatedAt)}</Text>
              </View>
            </View>
          </View>
        </View>

        {resume ? (
          <View style={styles.resumeBanner}>
            <Text style={styles.resumeLabel}>LINKED RESUME</Text>
            <Text style={styles.resumeName}>{resume.name}</Text>
          </View>
        ) : null}

        <AppCard style={styles.card}>
          <AppCard.Title title="Job description" subtitle="Stored on this device" />
          <AppCard.Content>
            <Text style={styles.body}>{application.jobDescription}</Text>
          </AppCard.Content>
        </AppCard>

        {relatedAnalysis ? (
          <AppCard style={styles.card}>
            <AppCard.Title
              title="ATS analysis"
              subtitle={`${relatedAnalysis.matchScore}% Resume Match`}
            />
            <AppCard.Content style={styles.analysisContent}>
              <View style={styles.scoreRow}>
                <View>
                  <Text style={styles.scoreLabel}>RESUME MATCH</Text>
                  <Text style={styles.scoreExplanation}>
                    An estimate of alignment with this job description, not a guarantee of ATS success.
                  </Text>
                </View>
                <Text style={styles.scoreValue}>{relatedAnalysis.matchScore}%</Text>
              </View>

              <View style={styles.keywordGroup}>
                <Text style={styles.keywordLabel}>Matching keywords</Text>
                {matchingKeywords.length ? (
                  <View style={styles.chipsRow}>
                    {matchingKeywords.map(keyword => (
                      <AppChip key={keyword} compact>
                        {keyword}
                      </AppChip>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No matching keywords identified.</Text>
                )}
              </View>

              <View style={styles.keywordGroup}>
                <Text style={styles.keywordLabel}>Missing keywords</Text>
                {missingKeywords.length ? (
                  <View style={styles.chipsRow}>
                    {missingKeywords.map(keyword => (
                      <AppChip key={keyword} compact>
                        {keyword}
                      </AppChip>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No missing keywords identified.</Text>
                )}
              </View>
            </AppCard.Content>
          </AppCard>
        ) : (
          <InfoBanner
            icon="i"
            title="No analysis yet"
            message="Run an analysis from this application to see Resume Match and keyword coverage."
            tone="neutral"
          />
        )}
      </ScrollView>

      {relatedAnalysis ? (
        <StickyActionBar>
          <StickyActionButton
            label="Edit Suggestions"
            variant="secondary"
            onPress={() =>
              navigation.navigate(ROUTES.EDIT_SUGGESTIONS, {analysisId: relatedAnalysis.id})
            }
          />
          <StickyActionButton
            label="View Full Analysis"
            onPress={() =>
              navigation.navigate(ROUTES.ANALYSIS_RESULT, {analysisId: relatedAnalysis.id})
            }
          />
        </StickyActionBar>
      ) : null}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xl2,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  heroCard: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  heroAccent: {
    height: 5,
    backgroundColor: colors.primary,
  },
  heroContent: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  eyebrow: {
    ...typography.label,
    color: colors.primaryDark,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  company: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  metaPill: {
    backgroundColor: colors.primaryTintLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  metaPillText: {
    ...typography.badge,
    color: colors.textSecondary,
  },
  resumeBanner: {
    gap: spacing.xxs,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.violetTintSoft,
    borderWidth: 1,
    borderColor: colors.violetTint,
  },
  resumeLabel: {
    ...typography.labelSm,
    color: colors.violet,
  },
  resumeName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  card: {
    borderRadius: borderRadius.lg,
  },
  body: {
    ...typography.body,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  analysisContent: {
    gap: spacing.lg,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryTintLight,
  },
  scoreLabel: {
    ...typography.labelSm,
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  scoreExplanation: {
    ...typography.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
    flex: 1,
  },
  scoreValue: {
    ...typography.h1,
    color: colors.primary,
  },
  keywordGroup: {
    gap: spacing.sm,
  },
  keywordLabel: {
    ...typography.h4,
    fontSize: 14,
    color: colors.textPrimary,
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
  },
});
