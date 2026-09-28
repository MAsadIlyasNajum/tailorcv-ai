import React, {useMemo, useLayoutEffect} from 'react';
import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import {AppButton, AppCard, PrimaryButton, ResumeCard, MetricPill, IconSymbol, InfoBanner} from '../components';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {ScreenContainer} from '../components/common/ScreenContainer';
import {ROUTES} from '../constants/routes';
import {useResumeStore} from '../store/useResumeStore';
import type {AppStackParamList} from '../app/navigation/AppNavigator';
import type {Resume, AnalysisResult, JobApplication} from '../types/resume';
import {colors} from '../app/theme/designTokens';
import {trackEvent} from '../services/analytics/analytics';

type Props = NativeStackScreenProps<AppStackParamList, typeof ROUTES.HOME>;

interface EnrichedAnalysis {
  result: AnalysisResult;
  application: JobApplication | undefined;
  resume: Resume | undefined;
}

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 5) return 'Good evening';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = Date.now();
  const diffDays = Math.floor((now - timestamp) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return '1d ago';
  if (diffDays < 30) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const ATS_INSIGHTS = [
  'Quantifying achievements with metrics boosts recruiter callbacks by 40%.',
  'ATS scanners miss 30% of graphics or tables — keep your layout simple and linear.',
  'Using standard section headings (Experience, Skills, Education) improves keyword matching by 25%.',
  'Including the exact job title from the posting can increase your ATS score by up to 15 points.',
  'Tailor your resume summary to include 3-5 keywords from the job description.',
];

const getRandomTip = (): string => {
  const seed = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return ATS_INSIGHTS[seed % ATS_INSIGHTS.length];
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return colors.greenText;
  if (score >= 60) return colors.primary;
  if (score >= 40) return colors.violet;
  return colors.redText;
};

export const HomeScreen = ({navigation}: Props): React.JSX.Element => {
  const resumes = useResumeStore(state => state.resumes);
  const currentResumeId = useResumeStore(state => state.currentResumeId);
  const removeResume = useResumeStore(state => state.removeResume);
  const setCurrentResume = useResumeStore(state => state.setCurrentResume);
  const jobApplications = useResumeStore(state => state.jobApplications);
  const analysisResults = useResumeStore(state => state.analysisResults);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'ResumAI',
      headerTitleStyle: {fontWeight: '700', fontFamily: 'Inter'},
    });
  }, [navigation]);

  const sortedResumes = useMemo(
    () => [...resumes].sort((a, b) => b.lastUsedAt - a.lastUsedAt),
    [resumes],
  );

  const recentResumes = useMemo(
    () => sortedResumes.slice(0, 3),
    [sortedResumes],
  );

  const currentResume = useMemo(
    () => resumes.find(r => r.id === currentResumeId) ?? null,
    [resumes, currentResumeId],
  );

  const enrichedAnalyses = useMemo(() => {
    return analysisResults
      .map(result => ({
        result,
        application: jobApplications.find(app => app.id === result.jobApplicationId),
        resume: resumes.find(r => r.id === result.resumeId),
      }))
      .sort((a, b) => b.result.updatedAt - a.result.updatedAt);
  }, [analysisResults, jobApplications, resumes]);

  const recentAnalyses = useMemo(
    () => enrichedAnalyses.slice(0, 3),
    [enrichedAnalyses],
  );

  const resumeScoreMap = useMemo(() => {
    const map = new Map<string, number>();
    const latestByResume = new Map<string, number>();
    for (const item of enrichedAnalyses) {
      const existing = latestByResume.get(item.result.resumeId);
      if (existing === undefined || item.result.updatedAt > existing) {
        latestByResume.set(item.result.resumeId, item.result.updatedAt);
        map.set(item.result.resumeId, item.result.matchScore);
      }
    }
    return map;
  }, [enrichedAnalyses]);

  const handleResumePress = (resumeId: string): void => {
    setCurrentResume(resumeId);
    navigation.navigate(ROUTES.RESUME_EDITOR, {resumeId});
  };

  const handleResumeOverflow = (resume: Resume): void => {
    Alert.alert(
      resume.name,
      'What would you like to do?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'View Details',
          onPress: () => navigation.navigate(ROUTES.RESUME_DETAIL, {resumeId: resume.id}),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete resume',
              `Are you sure you want to delete "${resume.name}"?`,
              [
                {text: 'Cancel', style: 'cancel'},
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    removeResume(resume.id);
                    trackEvent('resume_deleted');
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  const handleAnalysisPress = (analysisId: string): void => {
    navigation.navigate(ROUTES.ANALYSIS_RESULT, {analysisId});
  };

  const handleQuickContinuePress = (): void => {
    if (currentResume) {
      navigation.navigate(ROUTES.RESUME_EDITOR, {resumeId: currentResume.id});
    } else {
      navigation.navigate(ROUTES.RESUMES);
    }
  };

  const renderResumeItem = (resume: Resume): React.JSX.Element => {
    const atsScore = resumeScoreMap.get(resume.id);
    return (
      <ResumeCard
        key={resume.id}
        resume={resume}
        atsScore={atsScore}
        isCurrent={resume.id === currentResumeId}
        onPress={() => handleResumePress(resume.id)}
        onOverflowPress={() => handleResumeOverflow(resume)}
      />
    );
  };

  const renderAnalysisItem = (item: EnrichedAnalysis): React.JSX.Element => {
    const score = item.result.matchScore;
    return (
      <Pressable
        key={item.result.id}
        onPress={() => handleAnalysisPress(item.result.id)}
        style={({pressed}) => [
          styles.auditCard,
          pressed && {opacity: 0.8},
        ]}>
        <View style={styles.auditCardContent}>
          <View style={[styles.auditScoreCircle, {backgroundColor: colors.blueTintLight}]}>
            <Text style={[styles.auditScoreValue, {color: getScoreColor(score)}]}>
              {score}%
            </Text>
          </View>
          <View style={styles.auditTextContainer}>
            <Text style={styles.auditJobTitle}>
              {item.application?.jobTitle ?? 'Untitled role'}
            </Text>
            <View style={styles.auditMetaRow}>
              <Text style={styles.auditCompany}>
                {item.application?.companyName ?? 'Unknown company'}
              </Text>
              <Text style={styles.auditDot}>•</Text>
              <Text style={styles.auditDate}>
                {formatDate(item.result.createdAt)}
              </Text>
            </View>
          </View>
          <View style={styles.auditLink}>
            <Text style={styles.auditLinkIcon}>→</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderQuickContinue = (): React.JSX.Element | null => {
    if (!currentResume) {
      return null;
    }

    const progress = currentResume.text.trim().length > 0 ? 100 : 0;

    return (
      <AppCard style={styles.quickContinueCard}>
        <AppCard.Content>
          <View style={styles.quickContinueHeader}>
            <View style={styles.draftIconTile}>
              <IconSymbol name="document" size={20} color={colors.primaryDark} />
            </View>
            <View style={styles.quickContinueCopy}>
              <Text style={styles.draftEyebrow}>DRAFT IN PROGRESS</Text>
              <Text style={styles.quickContinueTitle} numberOfLines={1}>
                {currentResume.name}
              </Text>
            </View>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>{progress}%</Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, {width: `${progress}%`}]} />
            </View>
          </View>
          <View style={styles.quickContinueFooter}>
            <Text style={styles.quickContinueMeta}>
              Last edited {formatTimeAgo(currentResume.lastUsedAt)}
            </Text>
            <AppButton
              mode="outlined"
              compact
              onPress={handleQuickContinuePress}
              style={styles.continueButton}
              accessibilityLabel="Continue Editing">
              <View style={styles.continueContent}>
                <Text style={styles.continueButtonLabel}>Continue Editing</Text>
                <IconSymbol name="chevronRight" size={11} color={colors.primaryDark} />
              </View>
            </AppButton>
          </View>
        </AppCard.Content>
      </AppCard>
    );
  };

  const renderRecentResumes = (): React.JSX.Element => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Resumes</Text>
          {recentResumes.length > 0 && (
            <PrimaryButton
              label="View all"
              onPress={() => navigation.navigate(ROUTES.RESUMES)}
              fullWidth={false}
              mode="text"
            />
          )}
        </View>

        {recentResumes.length === 0 ? (
          <View style={styles.emptyMiniCard}>
            <Text style={styles.emptyMiniText}>No resumes yet. Create your first resume.</Text>
          </View>
        ) : (
          <View style={styles.resumeList}>
            {recentResumes.map(renderResumeItem)}
          </View>
        )}
      </View>
    );
  };

  const renderRecentAnalyses = (): React.JSX.Element => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.aiIcon}>✦</Text>
            <Text style={styles.sectionTitle}>Recent ATS Checks</Text>
          </View>
          <PrimaryButton
            label="History"
            onPress={() => navigation.navigate(ROUTES.HISTORY)}
            fullWidth={false}
            mode="text"
          />
        </View>

        {recentAnalyses.length === 0 ? (
          <View style={styles.emptyMiniCard}>
            <Text style={styles.emptyMiniText}>No ATS checks yet. Tailor your resume to a job to get started.</Text>
          </View>
        ) : (
          <View style={styles.auditList}>
            {recentAnalyses.map(renderAnalysisItem)}
          </View>
        )}
      </View>
    );
  };

  const renderDailyTip = (): React.JSX.Element => {
    return (
      <InfoBanner
        icon="✦"
        title="Daily job-search tip"
        message={getRandomTip()}
        tone="delight"
      />
    );
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
        <View style={styles.brandBar}>
          <View style={styles.brandLockup}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>R</Text>
            </View>
            <Text style={styles.brandName}>Resum<Text style={styles.brandAi}>AI</Text></Text>
          </View>
          <Pressable
            accessibilityLabel="Open profile"
            accessibilityRole="button"
            onPress={() => navigation.navigate(ROUTES.SETTINGS)}
            style={({pressed}) => [styles.profileButton, pressed && styles.profileButtonPressed]}>
            <IconSymbol name="profile" size={20} color={colors.primaryDark} />
          </Pressable>
        </View>

        <View style={styles.welcomeSection}>
            <View style={styles.greetingRow}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.greetingGlyph}>👋</Text>
            </View>
          <Text style={styles.subtitle}>
            Let's optimize your job applications today.
          </Text>

          <MetricPill
            items={[
              {value: `${resumes.length}`, label: 'Active Resumes'},
              {value: `${analysisResults.length}`, label: 'ATS Audits'},
            ]}
          />
        </View>

        <View style={styles.actionCards}>
          <AppCard style={styles.createCard}>
            <AppCard.Content>
              <View style={styles.cardHeader}>
                <View style={styles.fastSetupBadge}>
                  <Text style={styles.fastSetupText}>Fast Setup</Text>
                </View>
              </View>
              <Text style={styles.cardTitleWhite}>Create New Resume</Text>
              <Text style={styles.cardSubtitleBlue}>
                Build from scratch or ATS-friendly template
              </Text>
              <View style={styles.createButton}>
                <PrimaryButton
                  label="+ New Resume"
                   onPress={() => {
                    navigation.navigate(ROUTES.RESUMES);
                  }}
                  fullWidth={false}
                  mode="text"
                  textColor={colors.primary}
                />
              </View>
            </AppCard.Content>
          </AppCard>

          <AppCard style={styles.tailorCard}>
            <AppCard.Content>
              <View style={styles.cardHeader}>
                <View style={styles.aiMatchBadge}>
                  <Text style={styles.aiMatchIcon}>✦</Text>
                  <Text style={styles.aiMatchText}>AI Match</Text>
                </View>
              </View>
              <Text style={styles.cardTitleDark}>Tailor Resume to Job</Text>
              <Text style={styles.cardSubtitle}>
                Instant job description comparison &amp; keyword optimization
              </Text>
              <PrimaryButton
                label="Analyze Job Description"
                onPress={() => {
                  navigation.navigate(ROUTES.JOB_DESCRIPTION);
                }}
                fullWidth={false}
                mode="contained"
                bgColor={colors.violet}
              />
            </AppCard.Content>
          </AppCard>
        </View>

        {renderQuickContinue()}

        {renderRecentResumes()}

        {renderRecentAnalyses()}

        {renderDailyTip()}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 24,
  },
  brandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  brandMarkText: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    color: colors.surface,
  },
  brandName: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    fontFamily: 'Inter',
    letterSpacing: -0.45,
    color: colors.textPrimary,
  },
  brandAi: {
    color: colors.primary,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  profileButtonPressed: {
    opacity: 0.75,
  },
  welcomeSection: {
    gap: 8,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'Inter',
    letterSpacing: -0.52,
    lineHeight: 34,
  },
  greetingGlyph: {
    fontSize: 22,
    lineHeight: 20,
    fontFamily: 'serif',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    fontFamily: 'Inter',
    lineHeight: 20,
    marginTop: 2,
  },
  actionCards: {
    gap: 12,
  },
  createCard: {
    borderRadius: 12,
    backgroundColor: colors.primaryDark,
    overflow: 'hidden',
  },
  tailorCard: {
    borderRadius: 12,
    backgroundColor: colors.blueTintLight,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  fastSetupBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  fastSetupText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.surface,
    fontFamily: 'Inter',
    lineHeight: 14,
  },
  aiMatchBadge: {
    backgroundColor: colors.violetTint,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiMatchIcon: {
    fontSize: 11,
    color: colors.violet,
  },
  aiMatchText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.violet,
    fontFamily: 'Inter',
    lineHeight: 14,
  },
  cardTitleWhite: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.surface,
    fontFamily: 'Inter',
    lineHeight: 24,
  },
  cardTitleDark: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'Inter',
    lineHeight: 24,
  },
  cardSubtitleBlue: {
    fontSize: 13,
    fontWeight: '400',
    color: '#B4C5FF',
    fontFamily: 'Inter',
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 16,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    fontFamily: 'Inter',
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 16,
  },
  createButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  quickContinueCard: {
    borderRadius: 12,
  },
  quickContinueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  draftIconTile: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickContinueCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  draftEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.55,
    fontFamily: 'Inter',
    color: colors.violet,
  },
  progressBadge: {
    backgroundColor: colors.primaryTintLighter,
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0.12,
    fontFamily: 'Inter',
    color: colors.primaryDark,
  },
  quickContinueTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'Inter',
    lineHeight: 24,
    letterSpacing: -0.18,
  },
  quickContinueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickContinueMeta: {
    flex: 1,
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    fontFamily: 'Inter',
    lineHeight: 18,
  },
  continueButton: {
    minHeight: 36,
    borderRadius: 8,
    backgroundColor: colors.primaryTintLighter,
    borderColor: colors.primaryTintLighter,
    paddingHorizontal: 12,
    gap: 6,
  },
  continueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  continueButtonLabel: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.44,
    fontFamily: 'Inter',
    color: colors.primaryDark,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.primaryTintLighter,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primaryDark,
    borderRadius: 9999,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  aiIcon: {
    fontSize: 16,
    color: colors.violet,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'Inter',
    lineHeight: 24,
  },
  resumeList: {
    gap: 12,
  },
  emptyMiniCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.shadowColor,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyMiniText: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    fontFamily: 'Inter',
    lineHeight: 18,
  },
  auditCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    shadowColor: colors.shadowColor,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    padding: 16,
  },
  auditCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  auditScoreCircle: {
    borderRadius: 9999,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  auditScoreValue: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Inter',
    lineHeight: 14,
  },
  auditTextContainer: {
    flex: 1,
    gap: 2,
  },
  auditJobTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'Inter',
    lineHeight: 18,
  },
  auditMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  auditCompany: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
    fontFamily: 'Inter',
    lineHeight: 16,
  },
  auditDot: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textQuaternary,
  },
  auditDate: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    fontFamily: 'Inter',
    lineHeight: 14,
  },
  auditList: {
    gap: 12,
  },
  auditLink: {
    padding: 4,
  },
  auditLinkIcon: {
    fontSize: 18,
    color: colors.textTertiary,
    fontWeight: '400',
  },


});
