import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {PrimaryButton} from '../components/common/PrimaryButton';
import {AppButton, AppCard, EmptyState, InfoBanner} from '../components/index';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {useResumeStore} from '../store/useResumeStore';
import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ROUTES} from '../constants/routes';
import type {ResumeSection} from '../types/resume';
import {colors, typography, spacing, borderRadius, shadows} from '../app/theme/designTokens';

type Props = NativeStackScreenProps<AppStackParamList, typeof ROUTES.RESUME_EXTRACTION_REVIEW>;

const truncate = (value?: string | null, max = 80): string => {
  if (!value) {
    return '';
  }
  return value.length > max ? `${value.slice(0, max)}…` : value;
};

const summarizeSection = (section: ResumeSection): string => {
  switch (section.type) {
    case 'personalInfo': {
      const name = section.data.fullName ?? section.data.emails[0]?.value;
      return name ? `Name: ${name}` : 'Contact details detected';
    }
    case 'intro':
      return section.data.summary ? truncate(section.data.summary) : 'Intro detected';
    case 'experience':
      return `${section.entries.length} experience${section.entries.length === 1 ? '' : 's'}`;
    case 'projects':
      return `${section.entries.length} project${section.entries.length === 1 ? '' : 's'}`;
    case 'education':
      return `${section.entries.length} education ${section.entries.length === 1 ? 'entry' : 'entries'}`;
    case 'skills': {
      const total =
        section.uncategorized.length +
        section.groups.reduce((sum, g) => sum + g.skills.length, 0);
      return `${total} skill${total === 1 ? '' : 's'}`;
    }
    case 'certifications':
      return `${section.entries.length} certification${section.entries.length === 1 ? '' : 's'}`;
    case 'custom':
      return section.title ?? 'Custom section';
    default:
      return 'Unknown section';
  }
};

export const ResumeExtractionReviewScreen = ({route}: Props): React.JSX.Element => {
  const navigation = useNavigation();
  const {resumeId} = route.params;
  const resume = useResumeStore(state => state.resumes.find(r => r.id === resumeId) ?? null);
  const acceptResumeSuggestion = useResumeStore(state => state.acceptResumeSuggestion);
  const rejectResumeSuggestion = useResumeStore(state => state.rejectResumeSuggestion);
  const extractionError = useResumeStore(state => state.extractionError);

  const suggestion = resume?.aiSuggestions;

  const handleAcceptAll = (): void => {
    acceptResumeSuggestion(resumeId);
    navigation.navigate(ROUTES.RESUME_EDITOR as never, {resumeId} as never);
  };

  const handleDiscard = (): void => {
    rejectResumeSuggestion(resumeId);
    navigation.navigate(ROUTES.RESUME_EDITOR as never, {resumeId} as never);
  };

  const handleAcceptSection = (section: ResumeSection): void => {
    acceptResumeSuggestion(resumeId, [section.type]);
  };

  if (!suggestion) {
    return (
      <ScreenContainer>
        <EmptyState
          title="AI Suggestions"
          description="No structured suggestions are available. Run extraction again from the editor."
          action={
            <PrimaryButton label="Back" onPress={() => navigation.goBack()} />
          }
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
        <AppCard>
          <AppCard.Title
            title="AI found"
            subtitle="Review the proposed structure. Accept only what you want."
          />
        </AppCard>

        {extractionError ? (
          <AppCard>
            <AppCard.Content>
              <Text style={styles.errorText}>{extractionError}</Text>
            </AppCard.Content>
          </AppCard>
        ) : null}

        {suggestion.sections.map((section, index) => {
          const label =
            section.type === 'custom'
              ? section.title ?? 'Custom'
              : section.type.charAt(0).toUpperCase() + section.type.slice(1);
          return (
            <AppCard key={`${section.type}-${index}`} style={styles.sectionCard}>
              <AppCard.Title title={`✓ ${label}`} subtitle={summarizeSection(section)} />
              <AppCard.Content>
                <AppButton label="Accept" onPress={() => handleAcceptSection(section)} />
              </AppCard.Content>
            </AppCard>
          );
        })}

        {suggestion.unmapped ? (
          <AppCard style={styles.sectionCard}>
            <AppCard.Title title="Unmapped text preserved" />
            <AppCard.Content>
              <Text style={styles.bodyText}>{truncate(suggestion.unmapped, 240)}</Text>
            </AppCard.Content>
          </AppCard>
        ) : null}

        <InfoBanner
          title="Accepted sections"
          message="Accept all remaining sections or discard the suggestions to start over."
          tone="violet"
        />

        <View style={styles.stickyActions}>
          <PrimaryButton label="Accept all remaining" onPress={handleAcceptAll} />
          <AppButton mode="text" onPress={handleDiscard}>
            Discard suggestions
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
  sectionCard: {
    borderRadius: borderRadius.lg,
    ...shadows.card,
  },
  bodyText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  errorText: {
    ...typography.body,
    color: colors.red,
  },
  stickyActions: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingTop: spacing.sm,
    marginTop: spacing.md,
    gap: spacing.sm,
    ...shadows.card,
  },
});
