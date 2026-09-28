import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {DimensionValue} from 'react-native';
import {colors, typography, spacing, shadows} from '../../app/theme/designTokens';
import {ProgressRing} from './ProgressRing';
import {IconSymbol} from './IconSymbol';

interface StrengthItem {
  label: string;
  score: number;
  max?: number;
}

interface ProfileStrengthCardProps {
  title?: string;
  overallScore: number;
  items: StrengthItem[];
  style?: any;
}

const getStatusLabel = (score: number): string => {
  if (score >= 80) {
    return 'Strong';
  }
  if (score >= 50) {
    return 'Fair';
  }
  if (score > 0) {
    return 'Getting started';
  }
  return 'Empty';
};

export const ProfileStrengthCard = ({
  title = 'Profile Strength',
  overallScore,
  items,
  style,
}: ProfileStrengthCardProps): React.JSX.Element => {
  const [breakdownOpen, setBreakdownOpen] = React.useState(true);
  const max = items.reduce((total, item) => total + (item.max ?? 100), 0);
  const score = items.reduce((total, item) => total + item.score, 0);
  const weakest = items.filter(item => (item.max ?? 100) - item.score > 0);
  const completed = items.length - weakest.length;
  const improvements = Math.min(items.length, Math.max(0, Math.round((1 - score / (max || 1)) * items.length)));

  return (
    <View style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>{getStatusLabel(overallScore)}</Text>
            </View>
          </View>
          <Text style={styles.description}>
            {completed} of {items.length} key sections complete
          </Text>
        </View>
        <ProgressRing progress={overallScore} size={48} strokeWidth={4.5}>
          <Text style={styles.ringValue}>{overallScore}%</Text>
        </ProgressRing>
      </View>

      <View style={styles.tipsRow}>
        <View style={styles.tipsIcon}>
          <IconSymbol name="sparkle" size={13} color={colors.amberText} />
        </View>
        <Text style={styles.tipsText} numberOfLines={2}>
          {improvements > 0
            ? `${improvements} improvement${improvements === 1 ? '' : 's'} ready`
            : 'Everything is complete'}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={breakdownOpen ? 'Hide section breakdown' : 'View section breakdown'}
          onPress={() => setBreakdownOpen(open => !open)}
          style={styles.tipsToggle}>
          <Text style={styles.tipsToggleText}>{breakdownOpen ? 'Hide' : 'View'}</Text>
          <IconSymbol
            name={breakdownOpen ? 'arrowUp' : 'chevronRight'}
            size={10}
            color={colors.violet}
          />
        </Pressable>
      </View>

      {breakdownOpen ? (
        <View style={styles.itemsList}>
          {items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemLabel}>{item.label}</Text>
              <View style={styles.itemBar}>
                <View
                  style={[
                    styles.itemBarFill,
                    {width: `${((item.score / (item.max ?? 100)) * 100).toFixed(1)}%` as DimensionValue},
                  ]}
                />
              </View>
              <Text style={styles.itemScore}>{item.score}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  statusPill: {
    backgroundColor: colors.greenLight,
    borderRadius: 9999,
    paddingHorizontal: 10,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.44,
    fontFamily: 'Inter',
    color: colors.greenText,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
  ringValue: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: -0.07,
    fontFamily: 'Inter',
    color: colors.primaryDark,
  },
  tipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceTint,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tipsIcon: {
    width: 24,
    height: 24,
    borderRadius: 9999,
    backgroundColor: colors.violetTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.12,
    fontFamily: 'Inter',
    color: colors.textPrimary,
  },
  tipsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tipsToggleText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.44,
    fontFamily: 'Inter',
    color: colors.violet,
  },
  itemsList: {
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  itemBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.primaryTintLighter,
    borderRadius: 3,
    overflow: 'hidden',
  },
  itemBarFill: {
    height: '100%',
    backgroundColor: colors.primaryDark,
    borderRadius: 3,
  },
  itemScore: {
    ...typography.bodySemi,
    color: colors.textPrimary,
  },
});

export default ProfileStrengthCard;
