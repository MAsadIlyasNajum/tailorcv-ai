import React, {useEffect, useMemo, useRef, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp, NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  AppButton,
  AppCard,
  InfoBanner,
  ProfileStrengthCard,
  StickyActionBar,
  StickyActionButton,
} from '../components';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {SaveIndicator} from '../components/common/SaveIndicator';
import {SuggestionsPanel} from '../components/resumeEditor/SuggestionsPanel';
import {useResumeStore} from '../store/useResumeStore';
import {runStructuredExtraction} from '../services/ai/extractResumeUseCase';
import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ROUTES} from '../constants/routes';
import type {ResumeContent, ResumeSection, SectionType} from '../types/resume';
import {useResumeContent} from '../components/resumeEditor/useResumeContent';
import {addSection, ensureContent} from '../utils/resume/contentMutators';
import {createSection, nextOrder} from '../utils/resume/sectionFactory';
import {calculateAtsAnalysis} from '../services/ats/atsAnalysis';
import {SectionAdder} from '../components/resumeEditor/SectionAdder';
import {PersonalInfoSection} from '../components/resumeEditor/PersonalInfoSection';
import {IntroSection} from '../components/resumeEditor/IntroSection';
import {ExperienceSection} from '../components/resumeEditor/ExperienceSection';
import {ProjectsSection} from '../components/resumeEditor/ProjectsSection';
import {EducationSection} from '../components/resumeEditor/EducationSection';
import {SkillsSection} from '../components/resumeEditor/SkillsSection';
import {CertificationsSection} from '../components/resumeEditor/CertificationsSection';
import {CustomSection} from '../components/resumeEditor/CustomSection';
import {
  borderRadius,
  colors,
  shadows,
  spacing,
  typography,
} from '../app/theme/designTokens';

type Props = NativeStackScreenProps<AppStackParamList, typeof ROUTES.RESUME_EDITOR>;

type StrengthData = {
  overallScore: number;
  items: Array<{label: string; score: number}>;
};

const renderSection = (
  resumeId: string,
  section: ResumeSection,
  index: number,
  count: number,
): React.ReactNode => {
  const props = {resumeId, section, index, count};
  switch (section.type) {
    case 'personalInfo':
      return <PersonalInfoSection {...props} />;
    case 'intro':
      return <IntroSection {...props} />;
    case 'experience':
      return <ExperienceSection {...props} />;
    case 'projects':
      return <ProjectsSection {...props} />;
    case 'education':
      return <EducationSection {...props} />;
    case 'skills':
      return <SkillsSection {...props} />;
    case 'certifications':
      return <CertificationsSection {...props} />;
    case 'custom':
      return <CustomSection {...props} />;
    default:
      return null;
  }
};

const getContentStrength = (content: ResumeContent): StrengthData => {
  const personalInfo = content.sections.find(section => section.type === 'personalInfo');
  const intro = content.sections.find(section => section.type === 'intro');
  const experience = content.sections.find(section => section.type === 'experience');
  const education = content.sections.find(section => section.type === 'education');
  const skills = content.sections.find(section => section.type === 'skills');

  const personalScore = personalInfo?.type === 'personalInfo'
    ? [
        personalInfo.data.fullName ?? `${personalInfo.data.firstName ?? ''} ${personalInfo.data.lastName ?? ''}`,
        personalInfo.data.emails[0]?.value,
        personalInfo.data.phoneNumbers[0]?.value,
      ].filter(value => value?.trim()).length * 34
    : 0;
  const summaryScore = intro?.type === 'intro' && intro.data.summary?.trim() ? 100 : 0;
  const experienceScore = experience?.type === 'experience' && experience.entries.length > 0 ? 100 : 0;
  const educationScore = education?.type === 'education' && education.entries.length > 0 ? 100 : 0;
  const skillCount = skills?.type === 'skills'
    ? skills.uncategorized.length + skills.groups.reduce((total, group) => total + group.skills.length, 0)
    : 0;
  const skillsScore = Math.min(100, skillCount * 20);
  const items = [
    {label: 'Contact', score: Math.min(100, personalScore)},
    {label: 'Summary', score: summaryScore},
    {label: 'Experience', score: experienceScore},
    {label: 'Education', score: educationScore},
    {label: 'Skills', score: skillsScore},
  ];

  return {
    overallScore: Math.round(items.reduce((total, item) => total + item.score, 0) / items.length),
    items,
  };
};

const formatUpdatedAt = (timestamp: number): string =>
  new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export const ResumeEditorScreen = ({route}: Props): React.JSX.Element => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const {resumeId} = route.params;
  const resume = useResumeStore(state => state.resumes.find(r => r.id === resumeId) ?? null);
  const setCurrentResume = useResumeStore(state => state.setCurrentResume);
  const updateResumeContent = useResumeStore(state => state.updateResumeContent);
  const isExtracting = useResumeStore(state => state.isExtracting);
  const extractionError = useResumeStore(state => state.extractionError);
  const analysisResults = useResumeStore(state => state.analysisResults);
  const currentAnalysisId = useResumeStore(state => state.currentAnalysisId);
  const applyOptimizationSuggestion = useResumeStore(state => state.applyOptimizationSuggestion);
  const dismissOptimizationSuggestion = useResumeStore(state => state.dismissOptimizationSuggestion);
  const {content} = useResumeContent(resumeId);
  const [showRaw, setShowRaw] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevUpdatedAt = useRef(resume?.updatedAt ?? 0);
  const resumeUpdatedAt = resume?.updatedAt;

  const analysisResult = useMemo(
    () => analysisResults.find(r => r.id === currentAnalysisId) ?? null,
    [analysisResults, currentAnalysisId],
  );

  const optimizationSuggestions = useMemo(() => {
    if (!analysisResult || !content) {
      return [];
    }
    const analysis = calculateAtsAnalysis(content, analysisResult);
    const appliedIds = resume?.appliedSuggestions || [];
    return analysis.optimizationSuggestions.map(suggestion => ({
      ...suggestion,
      applied: appliedIds.includes(suggestion.id),
    }));
  }, [analysisResult, content, resume?.appliedSuggestions]);

  const handleApplySuggestion = (suggestion: import('../types/resume').OptimizationSuggestion): void => {
    applyOptimizationSuggestion(resumeId, suggestion);
  };

  const handleDismissSuggestion = (suggestion: import('../types/resume').OptimizationSuggestion): void => {
    dismissOptimizationSuggestion(resumeId, suggestion.id);
  };

  useEffect(() => {
    if (resumeUpdatedAt !== undefined && resumeUpdatedAt !== prevUpdatedAt.current) {
      prevUpdatedAt.current = resumeUpdatedAt;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => setSavedAt(Date.now()), 300);
    }
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [resumeUpdatedAt]);

  const showSaved = savedAt !== null && Date.now() - savedAt < 1500;

  const handleExtract = async (): Promise<void> => {
    const proposal = await runStructuredExtraction();
    if (proposal) {
      navigation.navigate(ROUTES.RESUME_EXTRACTION_REVIEW as never, {resumeId} as never);
    }
  };

  const sections = useMemo(
    () => [...content.sections].sort((a, b) => a.order - b.order),
    [content.sections],
  );

  const isMinimalResume = content.sections.length === 2 &&
    content.sections.every(section => section.type === 'personalInfo' || section.type === 'intro');

  const strength = useMemo<StrengthData>(() => {
    if (!analysisResult) {
      return getContentStrength(content);
    }
    const breakdown = calculateAtsAnalysis(content, analysisResult).scoreBreakdown;
    return {
      overallScore: breakdown.overall,
      items: [
        {label: 'Keywords', score: breakdown.keywords},
        {label: 'Skills', score: breakdown.skills},
        {label: 'Experience', score: breakdown.experience},
        {label: 'Education', score: breakdown.education},
        {label: 'Format', score: breakdown.formatting},
      ],
    };
  }, [analysisResult, content]);

  if (!resume) {
    return (
      <ScreenContainer>
        <AppCard>
          <Text style={styles.notFound}>Resume not found.</Text>
          <AppButton label="Back" onPress={() => navigation.goBack()} />
        </AppCard>
      </ScreenContainer>
    );
  }

  const handleAddSection = (type: SectionType, title?: string): void => {
    const ordered = ensureContent(resume.content).sections;
    updateResumeContent(resumeId, prev => addSection(prev, createSection(type, nextOrder(ordered), title ? {title} : {})));
  };

  const handlePreview = (): void => {
    navigation.navigate(ROUTES.RESUME_PREVIEW as never, {resumeId} as never);
  };

  const handleDone = (): void => {
    setCurrentResume(resumeId);
    navigation.goBack();
  };

  const handleAtsCheck = (): void => {
    setCurrentResume(resumeId);
    if (analysisResult) {
      navigation.navigate(ROUTES.ANALYSIS_RESULT, {analysisId: analysisResult.id});
    } else {
      navigation.navigate(ROUTES.JOB_DESCRIPTION);
    }
  };

  const rawText = resume.text?.trim();

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View style={styles.heroCopy}>
                <Text style={styles.eyebrow}>RESUME WORKSPACE</Text>
                <Text style={styles.title}>{resume.name}</Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {resume.metadata?.fileName ?? `${resume.sourceType.toUpperCase()} resume`} · Updated {formatUpdatedAt(resume.updatedAt)}
                </Text>
              </View>
              <SaveIndicator visible={showSaved} />
            </View>
            <View style={styles.heroActions}>
              <View style={styles.heroActionSlot}>
                <AppButton
                  label="Extract with AI"
                  mode="outlined"
                  compact
                  loading={isExtracting}
                  onPress={handleExtract}
                />
              </View>
              <View style={styles.doneSlot}>
                <AppButton
                  label="Done"
                  mode="contained"
                  compact
                  onPress={handleDone}
                />
              </View>
            </View>
          </View>

          {optimizationSuggestions.length > 0 ? (
            <SuggestionsPanel
              suggestions={optimizationSuggestions}
              onApply={handleApplySuggestion}
              onDismiss={handleDismissSuggestion}
            />
          ) : null}

          {rawText ? (
            <AppCard style={styles.sourceCard}>
              <AppCard.Content>
                <View style={styles.sourceHeader}>
                  <View style={styles.sourceCopy}>
                    <Text style={styles.cardLabel}>ORIGINAL SOURCE</Text>
                    <Text style={styles.cardTitle}>Extracted text preserved</Text>
                  </View>
                  <AppButton
                    label={showRaw ? 'Hide' : 'View'}
                    onPress={() => setShowRaw(value => !value)}
                    mode="text"
                    compact
                  />
                </View>
                {showRaw ? <Text style={styles.rawText}>{rawText}</Text> : null}
              </AppCard.Content>
            </AppCard>
          ) : null}

          <ProfileStrengthCard
            title="Profile strength"
            overallScore={strength.overallScore}
            items={strength.items}
            style={styles.strengthCard}
          />

          <View style={styles.sectionHeading}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Resume Sections</Text>
              <View style={styles.sectionCountChip}>
                <Text style={styles.sectionCountText}>{sections.length} Active</Text>
              </View>
            </View>
            <Text style={styles.sectionHint}>Hold &amp; drag to reorder</Text>
          </View>

          {isMinimalResume ? (
            <AppCard style={styles.emptyStateCard}>
              <Text style={styles.emptyTitle}>Start building your resume</Text>
              <Text style={styles.emptyBody}>
                Add sections to create a structured resume that you can edit, preview, and export.
              </Text>
              <View style={styles.emptyActions}>
                <AppButton mode="outlined" compact onPress={() => handleAddSection('experience')}>
                  + Experience
                </AppButton>
                <AppButton mode="outlined" compact onPress={() => handleAddSection('projects')}>
                  + Projects
                </AppButton>
                <AppButton mode="outlined" compact onPress={() => handleAddSection('education')}>
                  + Education
                </AppButton>
                <AppButton mode="outlined" compact onPress={() => handleAddSection('skills')}>
                  + Skills
                </AppButton>
              </View>
            </AppCard>
          ) : (
            <View style={styles.sectionStack}>
              {sections.map((section, index) => (
                <View key={section.id} style={styles.sectionCard}>
                  {renderSection(resumeId, section, index, sections.length)}
                </View>
              ))}
            </View>
          )}

          <View style={styles.addSectionArea}>
            <SectionAdder sections={sections} onAdd={handleAddSection} />
          </View>

          {extractionError ? (
            <InfoBanner
              title="Extraction needs attention"
              message={extractionError}
              icon="!"
              tone="neutral"
            />
          ) : null}
        </ScrollView>

        <StickyActionBar style={styles.actionBar}>
          <StickyActionButton label="ATS Check" onPress={handleAtsCheck} variant="violet" />
          <StickyActionButton label="Preview Resume" onPress={handlePreview} variant="primary" />
        </StickyActionBar>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 160,
    gap: spacing.lg,
  },
  heroCard: {
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderRadius: 12,
    ...shadows.card,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  heroCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  eyebrow: {
    ...typography.labelSm,
    color: colors.primaryDark,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textTertiary,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  heroActionSlot: {
    flex: 1,
    minWidth: 0,
  },
  doneSlot: {
    width: 92,
    flexGrow: 0,
    flexShrink: 0,
  },
  sourceCard: {
    ...shadows.card,
  },
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sourceCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  cardLabel: {
    ...typography.labelSm,
    color: colors.textTertiary,
  },
  cardTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  rawText: {
    ...typography.body,
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  sectionCountChip: {
    backgroundColor: colors.blueTint,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sectionCountText: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    fontFamily: 'JetBrains Mono',
    color: colors.textSecondary,
  },
  sectionHint: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  sectionStack: {
    gap: 0,
  },
  sectionCard: {
    borderRadius: borderRadius.lg,
  },
  addSectionArea: {
    borderRadius: borderRadius.lg,
  },
  strengthCard: {
    backgroundColor: colors.surface,
    borderWidth: 0,
  },
  emptyStateCard: {
    borderTopColor: colors.primary,
    borderTopWidth: 3,
    backgroundColor: colors.primaryTintLight,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyBody: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  emptyActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionBar: {
    marginHorizontal: -spacing.lg,
    marginBottom: -spacing.lg,
  },
  notFound: {
    ...typography.bodyLarge,
    color: colors.textTertiary,
    marginBottom: spacing.lg,
  },
});
