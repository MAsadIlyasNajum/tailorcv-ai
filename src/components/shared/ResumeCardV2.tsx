import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, typography, spacing, borderRadius, shadows} from '../../app/theme/designTokens';
import type {Resume} from '../../types/resume';
import {AtsRadialGauge} from './AtsRadialGauge';

interface ResumeCardV2Props {
  resume: Resume;
  atsScore?: number;
  matchLabel?: string;
  auditCount?: number;
  variant?: 'base' | 'tailored' | 'draft';
  targetLabel?: string;
  onEdit?: () => void;
  onTailor?: () => void;
  onOverflow?: () => void;
  onPress?: () => void;
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = Date.now();
  const diffDays = Math.floor((now - timestamp) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return '1d ago';
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
};

export const ResumeCardV2 = ({
  resume,
  atsScore,
  matchLabel,
  auditCount,
  variant = 'base',
  targetLabel,
  onEdit,
  onTailor,
  onOverflow,
  onPress,
}: ResumeCardV2Props): React.JSX.Element => {
  const isTailored = variant === 'tailored';
  const isDraft = variant === 'draft';
  const badgeConfig = isTailored
    ? {bg: colors.violetTint, text: colors.violet, label: `Tailored${targetLabel ? ` for ${targetLabel}` : ''}`}
    : isDraft
    ? {bg: colors.primaryTintLight, text: colors.textSecondary, label: 'General Draft'}
    : {bg: colors.primaryTint, text: colors.primaryDark, label: 'Base Resume'};

  return (
    <Pressable onPress={onPress} style={({pressed}) => [styles.card, pressed && {opacity: 0.92}]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.badge, {backgroundColor: badgeConfig.bg}]}>
            <Text style={[styles.badgeText, {color: badgeConfig.text}]}>{badgeConfig.label}</Text>
          </View>
          <Text style={styles.updated}>• Last updated {formatDate(resume.lastUsedAt)}</Text>
        </View>
        <Pressable onPress={onOverflow} hitSlop={8} style={styles.overflowBtn}>
          <Text style={styles.overflowIcon}>⋮</Text>
        </Pressable>
      </View>

      <Text style={styles.title} numberOfLines={1}>{resume.name}</Text>

      <View style={styles.statsRow}>
        <View style={styles.scoreBlock}>
          {atsScore !== undefined ? (
            <AtsRadialGauge score={atsScore} size={48} fontSize={12} />
          ) : (
            <View style={styles.scorePlaceholder} />
          )}
          <View style={styles.scoreMeta}>
            <Text style={styles.scoreLabel}>ATS SCORE</Text>
            {matchLabel ? (
              <View style={[styles.matchPill, {backgroundColor: colors.greenTint}]}>
                <Text style={[styles.matchPillText, {color: colors.greenStrong}]}>{matchLabel}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.auditBlock}>
          <Text style={styles.auditLabel}>Audit History</Text>
          <View style={styles.auditValue}>
            <Text style={styles.auditIcon}>✓</Text>
            <Text style={styles.auditCount}>{auditCount ?? 0} ATS checks</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={onEdit} style={styles.actionBtn}>
          <Text style={styles.actionIcon}>✎</Text>
          <Text style={styles.actionText}>Edit</Text>
        </Pressable>
        <Pressable onPress={onTailor} style={styles.actionBtn}>
          <Text style={styles.actionIcon}>✦</Text>
          <Text style={[styles.actionText, {color: colors.violet}]}>Tailor</Text>
        </Pressable>
        <Pressable onPress={onOverflow} style={styles.actionBtn}>
          <Text style={styles.actionIcon}>⋮</Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  badge: {
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    ...typography.badge,
    fontSize: 11,
    lineHeight: 14,
  },
  updated: {
    ...typography.monoSm,
    color: colors.textTertiary,
  },
  overflowBtn: {
    padding: 4,
  },
  overflowIcon: {
    fontSize: 20,
    color: colors.textTertiary,
  },
  title: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryTintLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.lg,
  },
  scoreBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  scorePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryTint,
  },
  scoreMeta: {
    gap: 4,
  },
  scoreLabel: {
    ...typography.labelSm,
    color: colors.textTertiary,
  },
  matchPill: {
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  matchPillText: {
    ...typography.badge,
    fontSize: 11,
    lineHeight: 14,
  },
  auditBlock: {
    flex: 1,
  },
  auditLabel: {
    ...typography.labelSm,
    color: colors.textTertiary,
  },
  auditValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  auditIcon: {
    color: colors.greenStrong,
    fontSize: 12,
  },
  auditCount: {
    ...typography.body,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.primaryTint,
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionIcon: {
    fontSize: 14,
    color: colors.primaryDark,
  },
  actionText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
  },
});

export default ResumeCardV2;