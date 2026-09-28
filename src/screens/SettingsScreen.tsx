import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AppCard, InfoBanner, ProLockedCard} from '../components';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {colors, typography, spacing, borderRadius, shadows} from '../app/theme/designTokens';

const PRIVACY_POINTS = [
  {
    title: 'Local-first storage',
    body: 'Your resumes, job applications, and analyses are stored only on this device. Nothing is synced to a cloud backend.',
  },
  {
    title: 'AI-only data flow',
    body: 'Resume text and job descriptions are sent to the AI provider only when you start an analysis.',
  },
  {
    title: 'On-device PDF extraction',
    body: 'PDF text extraction is processed entirely on your device before any analysis begins.',
  },
  {
    title: 'Private crash reports',
    body: 'Crash reports may include anonymized technical context, never resume text or job descriptions.',
  },
  {
    title: 'Event-only analytics',
    body: 'Only high-level events such as analysis started are recorded, with no raw resume or job data.',
  },
];

export const SettingsScreen = (): React.JSX.Element => {
  return (
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ACCOUNT</Text>
          <Text style={styles.title}>Profile & Settings</Text>
          <Text style={styles.subtitle}>
            TailorCV AI works without an account. Your data stays on this device.
          </Text>
        </View>

        <InfoBanner
          icon="◇"
          title="Guest workspace"
          message="You are using the local-first guest workspace. No sign-in is required and no account data is stored."
          tone="primary"
        />

        <AppCard style={styles.card}>
          <AppCard.Title title="Privacy" subtitle="How your data is handled" />
          <AppCard.Content style={styles.privacyList}>
            {PRIVACY_POINTS.map(point => (
              <View key={point.title} style={styles.privacyRow}>
                <View style={styles.privacyMarker} />
                <View style={styles.privacyCopy}>
                  <Text style={styles.privacyTitle}>{point.title}</Text>
                  <Text style={styles.privacyBody}>{point.body}</Text>
                </View>
              </View>
            ))}
          </AppCard.Content>
        </AppCard>

        <ProLockedCard
          title="Pro tools"
          description="Premium subscriptions are not connected in this build, so no upgrade flow or Pro-only functionality is presented."
          lockedFeature="Subscription management"
          style={styles.proCard}
        />

        <AppCard style={styles.card}>
          <AppCard.Title title="Roadmap" subtitle="Coming next" />
          <AppCard.Content>
            <Text style={styles.roadmapBody}>
              Resume builder improvements, cover letters, interview preparation, and optional cloud sync are planned for
              future releases.
            </Text>
          </AppCard.Content>
        </AppCard>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xl2,
  },
  header: {
    gap: spacing.xs,
  },
  eyebrow: {
    ...typography.label,
    color: colors.primaryDark,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
  },
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  privacyList: {
    gap: spacing.lg,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  privacyMarker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    backgroundColor: colors.primary,
  },
  privacyCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  privacyTitle: {
    ...typography.h4,
    fontSize: 15,
    color: colors.textPrimary,
  },
  privacyBody: {
    ...typography.body,
    color: colors.textSecondary,
  },
  proCard: {
    backgroundColor: colors.violetTintSoft,
    borderColor: colors.violetTint,
  },
  roadmapBody: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
