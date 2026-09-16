import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors} from '../../app/theme/designTokens';

type ScoreVariant = 'green' | 'violet' | 'blue' | 'red' | 'amber';

interface AtsScoreBadgeProps {
  score: number;
  label?: string;
  variant?: ScoreVariant;
  style?: object;
  textColorOverride?: string;
  bgColorOverride?: string;
}

const resolveVariant = (score: number): ScoreVariant => {
  if (score >= 80) return 'green';
  if (score >= 60) return 'blue';
  if (score >= 40) return 'amber';
  return 'red';
};

const VARIANT_CONFIG: Record<ScoreVariant, {bg: string; text: string}> = {
  green: {bg: colors.green, text: colors.greenBadgeText},
  violet: {bg: colors.violetTint, text: colors.deepViolet},
  blue: {bg: colors.blueTintLight, text: colors.primary},
  red: {bg: colors.redLight, text: colors.redText},
  amber: {bg: colors.blueTintLight, text: colors.primary},
};

export const AtsScoreBadge = ({
  score,
  label = 'ATS',
  variant,
  style,
  textColorOverride,
  bgColorOverride,
}: AtsScoreBadgeProps): React.JSX.Element => {
  const resolvedVariant = variant ?? resolveVariant(score);
  const config = VARIANT_CONFIG[resolvedVariant];

  return (
    <View
      style={[
        styles.badge,
        {backgroundColor: bgColorOverride ?? config.bg},
        style,
      ]}>
      <Text
        style={[
          styles.text,
          {color: textColorOverride ?? config.text},
        ]}>
        {score}
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    fontFamily: 'Inter',
  },
});
