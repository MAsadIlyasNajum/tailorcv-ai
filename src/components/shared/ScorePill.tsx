import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors} from '../../app/theme/designTokens';

const SCORE_CONFIG: Record<string, {bg: string; text: string; label: string}> = {
  green: {bg: colors.greenStrong, text: colors.greenBadgeText, label: 'Strong'},
  blue: {bg: colors.primary, text: colors.greenBadgeText, label: 'Good'},
  violet: {bg: colors.violet, text: colors.greenBadgeText, label: 'Fair'},
  red: {bg: colors.redStrong, text: colors.greenBadgeText, label: 'Weak'},
};

const resolveScore = (score: number): string => {
  if (score >= 80) return 'green';
  if (score >= 60) return 'blue';
  if (score >= 40) return 'violet';
  return 'red';
};

interface ScorePillProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md';
  style?: any;
}

export const ScorePill = ({score, label, size = 'md', style}: ScorePillProps): React.JSX.Element => {
  const variant = resolveScore(score);
  const config = SCORE_CONFIG[variant];
  const isSm = size === 'sm';

  return (
    <View style={[styles.pill, isSm && styles.sm, {backgroundColor: config.bg}, style]}>
      <Text style={[styles.score, isSm && styles.smScore, {color: config.text}]}>
        {score}
      </Text>
      <Text style={[styles.label, isSm && styles.smLabel, {color: config.text}]}>
        {label ?? config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  score: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.greenBadgeText,
    fontFamily: 'Inter',
    lineHeight: 16,
  },
  smScore: {
    fontSize: 11,
    lineHeight: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.greenBadgeText,
    fontFamily: 'Inter',
    lineHeight: 14,
  },
  smLabel: {
    fontSize: 10,
    lineHeight: 12,
  },
});

export default ScorePill;