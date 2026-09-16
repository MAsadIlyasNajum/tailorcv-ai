import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, typography, spacing, borderRadius} from '../app/theme/designTokens';

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

export const ProfileStrengthCard = ({title = 'Profile Strength', overallScore, items, style}: ProfileStrengthCardProps): React.JSX.Element => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.scoreWrap}>
          <Text style={styles.scoreValue}>{overallScore}</Text>
          <Text style={styles.scoreLabel}>/100</Text>
        </View>
      </View>
      <View style={styles.bar}>
        <View style={[styles.barFill, {width: `${overallScore}%` as any}]} />
      </View>
      <View style={styles.itemsList}>
        {items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemLabel}>{item.label}</Text>
            <View style={styles.itemBar}>
              <View style={[styles.itemBarFill, {width: `${(item.score / (item.max ?? 100)) * 100}%` as any}]} />
            </View>
            <Text style={styles.itemScore}>{item.score}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...{
      shadowColor: colors.shadowColor,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scoreWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  scoreValue: {
    ...typography.h2,
    fontSize: 24,
    color: colors.primary,
  },
  scoreLabel: {
    ...typography.body,
    color: colors.textTertiary,
  },
  bar: {
    height: 8,
    backgroundColor: colors.primaryTintLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
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
    width: 100,
    color: colors.textSecondary,
  },
  itemBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.primaryTintLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  itemBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  itemScore: {
    ...typography.body,
    width: 30,
    textAlign: 'right',
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

export default ProfileStrengthCard;