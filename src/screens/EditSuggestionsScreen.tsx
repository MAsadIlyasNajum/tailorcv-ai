import React, {useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton, AppCard, AppTextInput, FeatureChecklist, InfoBanner, Stepper, StickyActionBar, StickyActionButton} from '../components';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp, NativeStackScreenProps} from '@react-navigation/native-stack';

import {PrimaryButton} from '../components/common/PrimaryButton';
import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ROUTES} from '../constants/routes';
import {useResumeStore} from '../store/useResumeStore';
import {trackEvent} from '../services/analytics/analytics';
import {colors, spacing, typography, borderRadius, shadows} from '../app/theme/designTokens';

type Props = NativeStackScreenProps<AppStackParamList, typeof ROUTES.EDIT_SUGGESTIONS>;

type SectionDraft = {
  suggestedSummary: string;
  suggestedSkills: string;
  experienceImprovements: string;
  atsTips: string;
};

const INITIAL_DRAFT: SectionDraft = {
  suggestedSummary: '',
  suggestedSkills: '',
  experienceImprovements: '',
  atsTips: '',
};

export const EditSuggestionsScreen = ({route}: Props): React.JSX.Element => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const analysisResults = useResumeStore(state => state.analysisResults);
  const updateAnalysisResult = useResumeStore(state => state.updateAnalysisResult);

  const analysis = useMemo(() => {
    if (route.params?.analysisId) {
      return analysisResults.find(a => a.id === route.params.analysisId) ?? null;
    }
    return null;
  }, [analysisResults, route.params?.analysisId]);

  const [draft, setDraft] = useState<SectionDraft>(INITIAL_DRAFT);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (analysis) {
      setDraft({
        suggestedSummary: analysis.suggestedSummary,
        suggestedSkills: (analysis.suggestedSkills ?? []).join('\n'),
        experienceImprovements: (analysis.experienceImprovements ?? [])
          .map(item => `Original: ${item.original}\nImproved: ${item.improved}`)
          .join('\n\n'),
        atsTips: (analysis.atsTips ?? []).join('\n'),
      });
    }
  }, [analysis]);

  const handleSave = (): void => {
    if (!analysis) {
      return;
    }

    const suggestedSkills = draft.suggestedSkills
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    const atsTips = draft.atsTips
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    const experienceImprovements = draft.experienceImprovements
      .split('\n\n')
      .map(block => block.trim())
      .filter(Boolean)
      .map(block => {
        const originalMatch = block.match(/Original:\s*(.*)/);
        const improvedMatch = block.match(/Improved:\s*(.*)/);
        const original = originalMatch?.[1]?.trim() ?? '';
        const improved = improvedMatch?.[1]?.trim() ?? '';
        if (!original || !improved) {
          return null;
        }
        return {original, improved};
      })
      .filter((item): item is {original: string; improved: string} => item !== null);

    updateAnalysisResult(analysis.id, {
      suggestedSummary: draft.suggestedSummary,
      suggestedSkills,
      experienceImprovements,
      atsTips,
      userEditedSuggestions: {
        suggestedSummary: draft.suggestedSummary,
        suggestedSkills,
        experienceImprovements,
        atsTips,
      },
      updatedAt: Date.now(),
    });

    setSaved(true);
    trackEvent('suggestion_edited');
  };

  const handleReset = (): void => {
    if (!analysis) {
      return;
    }

    setDraft({
      suggestedSummary: analysis.suggestedSummary,
      suggestedSkills: (analysis.suggestedSkills ?? []).join('\n'),
      experienceImprovements: (analysis.experienceImprovements ?? [])
        .map(item => `Original: ${item.original}\nImproved: ${item.improved}`)
        .join('\n\n'),
      atsTips: (analysis.atsTips ?? []).join('\n'),
    });

    updateAnalysisResult(analysis.id, {
      userEditedSuggestions: undefined,
      updatedAt: Date.now(),
    });

    setSaved(false);
  };

  const auditItems = useMemo(() => {
    if (!analysis) {
      return [];
    }
    return [
      {label: 'Professional summary drafted', completed: Boolean(analysis.suggestedSummary)},
      {label: 'Skills identified', completed: (analysis.suggestedSkills ?? []).length > 0},
      {label: 'Experience improvements drafted', completed: (analysis.experienceImprovements ?? []).length > 0},
      {label: 'ATS formatting tips generated', completed: (analysis.atsTips ?? []).length > 0},
      {label: 'Custom edits applied', completed: Boolean(analysis.userEditedSuggestions)},
    ];
  }, [analysis]);

  const targetRole = useMemo(() => {
    if (!analysis) {
      return 'Target role';
    }
    if (analysis.jobTitle && analysis.companyName) {
      return `${analysis.jobTitle} @ ${analysis.companyName}`;
    }
    return analysis.jobTitle ?? analysis.companyName ?? 'Target role';
  }, [analysis]);

  const steps = [
    {label: 'Review Analysis', completed: true},
    {label: 'Edit Suggestions', current: true},
    {label: 'Generate Resume', completed: false},
  ];

  if (!analysis) {
    return (
      <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.wrapper}>
              <AppCard style={styles.card}>
                <AppCard.Content>
                  <Text style={styles.notFound}>Analysis not found.</Text>
                  <PrimaryButton label="Back" onPress={() => navigation.goBack()} />
                </AppCard.Content>
              </AppCard>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}>
        <View style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Stepper steps={steps} style={styles.stepper} />

            <InfoBanner
              icon="✦"
              title="Target Role"
              message={targetRole}
              tone="primary"
            />

            <InfoBanner
              icon="i"
              title="Ethical AI"
              message="These recommendations are AI-generated suggestions. Review and adjust them — your resume always stays under your control."
              tone="blue"
            />

            <FeatureChecklist items={auditItems} />

            <AppCard style={styles.card}>
              <AppCard.Title
                title="Edit Suggestions"
                subtitle="Modify the AI recommendations below. Original outputs are preserved."
              />
              <AppCard.Content>
                <Text style={styles.label}>Suggested Professional Summary</Text>
                <AppTextInput
                  multiline
                  value={draft.suggestedSummary}
                  onChangeText={value => setDraft({...draft, suggestedSummary: value})}
                  style={styles.input}
                  numberOfLines={4}
                />

                <Text style={styles.label}>Suggested Skills (one per line)</Text>
                <AppTextInput
                  multiline
                  value={draft.suggestedSkills}
                  onChangeText={value => setDraft({...draft, suggestedSkills: value})}
                  style={styles.input}
                  numberOfLines={4}
                />

                <Text style={styles.label}>
                  Experience Improvements (one per block, separated by blank lines)
                </Text>
                <AppTextInput
                  multiline
                  value={draft.experienceImprovements}
                  onChangeText={value => setDraft({...draft, experienceImprovements: value})}
                  style={[styles.input, styles.tallInput]}
                  numberOfLines={8}
                />

                <Text style={styles.label}>ATS Tips (one per line)</Text>
                <AppTextInput
                  multiline
                  value={draft.atsTips}
                  onChangeText={value => setDraft({...draft, atsTips: value})}
                  style={styles.input}
                  numberOfLines={4}
                />

                {saved ? (
                  <Text style={styles.savedText}>Your edits have been saved.</Text>
                ) : null}
              </AppCard.Content>
            </AppCard>
          </ScrollView>

          <View style={styles.stickyFooter}>
            <StickyActionBar>
              <View style={styles.footerColumn}>
                <StickyActionButton
                  label={saved ? 'Saved' : 'Save Edits'}
                  onPress={handleSave}
                  variant="primaryDark"
                  radius={12}
                  minHeight={48}
                />
                <AppButton mode="text" onPress={handleReset} style={styles.resetButton} fullWidth={false}>
                  Reset to AI original
                </AppButton>
              </View>
            </StickyActionBar>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    paddingBottom: 136,
  },
  scrollView: {
    flex: 1,
  },
  wrapper: {
    gap: spacing.md,
  },
  stepper: {
    alignSelf: 'flex-start',
  },
  card: {
    borderRadius: borderRadius.lg,
  },
  notFound: {
    ...typography.body,
    fontSize: 16,
    color: colors.textTertiary,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: -0.07,
    fontFamily: 'Inter',
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  input: {
    minHeight: 100,
  },
  tallInput: {
    minHeight: 160,
  },
  savedText: {
    marginTop: spacing.md,
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
    gap: spacing.xs,
  },
  resetButton: {
    alignSelf: 'center',
  },
});
