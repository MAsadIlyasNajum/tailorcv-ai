import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppButton, AppTextInput, InfoBanner, Stepper, StickyActionBar, StickyActionButton} from '../components';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ROUTES} from '../constants/routes';
import {runResumeAnalysis} from '../services/ai/analyzeResumeUseCase';
import {useResumeStore} from '../store/useResumeStore';
import {validateJobDescription} from '../utils/validation/jobDescriptionValidation';
import {trackEvent} from '../services/analytics/analytics';
import {colors, spacing, typography, borderRadius, shadows} from '../app/theme/designTokens';

const PROCESSING_STEPS: string[] = [
  'Parsing your resume and the job description...',
  'Matching required and preferred keywords...',
  'Weighing skills, experience, and formatting...',
  'Generating ATS-focused recommendations...',
];

export const JobDescriptionScreen = (): React.JSX.Element => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, typeof ROUTES.JOB_DESCRIPTION>>();
  const insets = useSafeAreaInsets();
  const resumes = useResumeStore(state => state.resumes);
  const currentResumeId = useResumeStore(state => state.currentResumeId);
  const jobApplications = useResumeStore(state => state.jobApplications);
  const currentJobApplicationId = useResumeStore(state => state.currentJobApplicationId);
  const addJobApplication = useResumeStore(state => state.addJobApplication);
  const updateJobApplication = useResumeStore(state => state.updateJobApplication);
  const setCurrentJobApplication = useResumeStore(state => state.setCurrentJobApplication);
  const isAnalyzing = useResumeStore(state => state.isAnalyzing);
  const analysisError = useResumeStore(state => state.analysisError);
  const setAnalysisError = useResumeStore(state => state.setAnalysisError);

  const currentResume = useMemo(
    () => resumes.find(r => r.id === currentResumeId) ?? null,
    [resumes, currentResumeId],
  );
  const currentJobApplication = useMemo(
    () => jobApplications.find(app => app.id === currentJobApplicationId) ?? null,
    [jobApplications, currentJobApplicationId],
  );

  const resumeText = currentResume?.text ?? '';
  const [jobDescription, setJobDescription] = useState(currentJobApplication?.jobDescription ?? '');

  const validation = useMemo(
    () => validateJobDescription(jobDescription),
    [jobDescription],
  );

  const enabled = Boolean(resumeText.trim()) && validation.valid && !isAnalyzing;

  const [processingStep, setProcessingStep] = useState(0);
  useEffect(() => {
    if (!isAnalyzing) {
      setProcessingStep(0);
      return;
    }
    const id = setInterval(() => {
      setProcessingStep(v => (v + 1) % PROCESSING_STEPS.length);
    }, 2000);
    return () => clearInterval(id);
  }, [isAnalyzing]);

  const handleAnalyze = async (): Promise<void> => {
    if (!enabled) {
      return;
    }

    trackEvent('analysis_started');

    const previousResultId = useResumeStore.getState().currentAnalysisId;

    await runResumeAnalysis();

    const nextState = useResumeStore.getState();
    const nextResultId = nextState.currentAnalysisId;

    if (!nextState.analysisError && nextResultId && nextResultId !== previousResultId) {
      trackEvent('analysis_completed');
      navigation.navigate(ROUTES.ANALYSIS_RESULT as any);
    } else if (nextState.analysisError) {
      trackEvent('analysis_failed');
    }
  };

  const handleJobDescriptionChange = (value: string): void => {
    setJobDescription(value);
    setAnalysisError(null);

    if (currentJobApplication) {
      updateJobApplication(currentJobApplication.id, {jobDescription: value});
    } else if (currentResumeId) {
      const newApp = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        resumeId: currentResumeId,
        jobDescription: value,
        status: 'active' as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addJobApplication(newApp);
      setCurrentJobApplication(newApp.id);
    }
  };

  const clearJobDescription = (): void => {
    setJobDescription('');
    setAnalysisError(null);
    if (currentJobApplication) {
      updateJobApplication(currentJobApplication.id, {jobDescription: ''});
    }
  };

  const steps = isAnalyzing
    ? [
        {label: 'Paste Job Description', completed: true},
        {label: 'Analyzing', current: true},
        {label: 'Review Results', completed: false},
      ]
    : [
        {label: 'Paste Job Description', current: true},
        {label: 'Analyzing', completed: false},
        {label: 'Review Results', completed: false},
      ];

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}>
        <View style={styles.flex}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, {paddingBottom: 100 + insets.bottom}]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Stepper steps={steps} style={styles.stepper} />

            <View style={styles.tagRow}>
              <View style={styles.matcherTag}>
                <Text style={styles.matcherTagIcon}>✦</Text>
                <Text style={styles.matcherTagText}>Semantic ATS Matcher</Text>
              </View>
            </View>

            <Text style={styles.title}>Paste Job Description</Text>
            <Text style={styles.subtitle}>
              Add the target job description to generate ATS-focused recommendations.
            </Text>

            {currentResume ? (
              <View style={styles.resumeBanner}>
                <View style={styles.resumeBannerIcon}>
                  <Text style={styles.resumeBannerIconText}>▤</Text>
                </View>
                <View style={styles.resumeBannerCopy}>
                  <Text style={styles.resumeBannerEyebrow}>ACTIVE RESUME</Text>
                  <Text style={styles.resumeBannerTitle}>{currentResume.name}</Text>
                  <Text style={styles.resumeBannerSub}>
                    {currentResume.sourceType === 'pdf' ? 'PDF resume' : 'Text resume'} · {currentResume.text.length} characters
                  </Text>
                </View>
                <AppButton
                  mode="outlined"
                  fullWidth={false}
                  compact
                  label="Change"
                  labelStyle={styles.changeActionLabel}
                  textColor={colors.primaryDark}
                  onPress={() => navigation.navigate(ROUTES.RESUMES as never)}
                  style={styles.changeAction}
                />
              </View>
            ) : null}

            <InfoBanner
              icon="i"
              title="Your privacy"
              message="Your resume and this job description stay on your device and are used only to generate this analysis."
              tone="blue"
            />

            <View style={styles.formCanvas}>
              <View style={styles.headerRow}>
                <Text style={styles.counterText}>{jobDescription.length} chars</Text>
                {jobDescription ? (
                  <AppButton mode="text" onPress={clearJobDescription}>
                    Clear
                  </AppButton>
                ) : null}
              </View>

              <AppTextInput
                multiline
                value={jobDescription}
                onChangeText={handleJobDescriptionChange}
                placeholder="Paste full job description here..."
                numberOfLines={12}
                style={styles.input}
                autoFocus={false}
                autoCapitalize="sentences"
                autoCorrect={true}
              />

              {jobDescription && !validation.valid ? (
                <Text style={styles.validation}>{validation.message}</Text>
              ) : null}

              {!jobDescription ? (
                <Text style={styles.helper}>Paste a full job description, including responsibilities, qualifications, and preferred skills.</Text>
              ) : null}

              {analysisError ? (
                <View style={styles.errorCard}>
                  <Text style={styles.errorTitle}>Analysis Failed</Text>
                  <Text style={styles.error}>{analysisError}</Text>
                  <View style={styles.errorActions}>
                    <AppButton mode="contained" onPress={() => {
                      handleAnalyze();
                    }}>
                      Try Again
                    </AppButton>
                    <AppButton mode="outlined" onPress={() => setAnalysisError(null)}>
                      Edit Job Description
                    </AppButton>
                  </View>
                </View>
              ) : null}
            </View>
          </ScrollView>

          <View style={styles.stickyFooter}>
            <StickyActionBar>
              <StickyActionButton
                label={isAnalyzing ? 'Analyzing...' : 'Run ATS Analysis'}
                onPress={handleAnalyze}
                disabled={!enabled}
                minHeight={48}
                radius={12}
              />
            </StickyActionBar>
          </View>
        </View>
      </KeyboardAvoidingView>

      {isAnalyzing ? (
        <View style={styles.processingOverlay}>
          <View style={styles.processingBackdrop} />
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.processingTitle}>Analyzing your resume</Text>
            <Text style={styles.processingStep}>{PROCESSING_STEPS[processingStep]}</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboard: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  stepper: {
    alignSelf: 'stretch',
  },
  title: {
    ...typography.h1,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matcherTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.violetTint,
    borderRadius: 9999,
    paddingHorizontal: 10,
    height: 22,
  },
  matcherTagIcon: {
    fontSize: 11,
    lineHeight: 14,
    color: colors.amberText,
  },
  matcherTagText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.44,
    fontFamily: 'Inter',
    color: colors.amberText,
  },
  resumeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    ...shadows.card,
  },
  resumeBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeBannerIconText: {
    fontSize: 18,
    lineHeight: 22,
    color: colors.deepViolet,
  },
  resumeBannerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  resumeBannerEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    letterSpacing: 0.55,
    fontFamily: 'Inter',
    color: colors.primaryDark,
  },
  resumeBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: -0.07,
    fontFamily: 'Inter',
    color: colors.textPrimary,
  },
  resumeBannerSub: {
    ...typography.body,
    color: colors.textSecondary,
  },
  changeAction: {
    minHeight: 26,
    borderRadius: 8,
    backgroundColor: colors.primaryTintLighter,
    borderColor: colors.primaryTintLighter,
    paddingHorizontal: 12,
  },
  changeActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.44,
  },
  formCanvas: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    ...shadows.card,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  counterText: {
    ...typography.labelSm,
  },
  input: {
    backgroundColor: colors.surfaceTint,
    minHeight: 260,
    borderRadius: 12,
  },
  validation: {
    ...typography.body,
    color: colors.redText,
    paddingHorizontal: spacing.md,
  },
  helper: {
    ...typography.body,
    color: colors.textTertiary,
    paddingHorizontal: spacing.md,
  },
  errorCard: {
    backgroundColor: colors.redTint,
    borderColor: colors.red,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.xs,
    marginHorizontal: spacing.md,
  },
  errorTitle: {
    ...typography.bodySemi,
    fontWeight: '700',
    color: colors.redStrong,
  },
  error: {
    ...typography.body,
    color: colors.redText,
  },
  errorActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
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
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    zIndex: 100,
  },
  processingBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  processingCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xl2,
    paddingVertical: spacing.xl2,
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.cardElevated,
    maxWidth: '90%',
  },
  processingTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.textPrimary,
  },
  processingStep: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
