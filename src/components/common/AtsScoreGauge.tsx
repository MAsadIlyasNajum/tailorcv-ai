import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors} from '../../app/theme/designTokens';

type ScoreColor = 'green' | 'blue' | 'violet' | 'red';

interface AtsScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
  sublabelColor?: string;
  style?: object;
}

const resolveColor = (score: number): ScoreColor => {
  if (score >= 80) return 'green';
  if (score >= 60) return 'blue';
  if (score >= 40) return 'violet';
  return 'red';
};

const COLOR_MAP: Record<ScoreColor, string> = {
  green: colors.greenText,
  blue: colors.greenText,
  violet: colors.violet,
  red: colors.redText,
};

export const AtsScoreGauge = ({
  score,
  size = 48,
  label,
  sublabelColor,
  style,
}: AtsScoreGaugeProps): React.JSX.Element => {
  const color = COLOR_MAP[resolveColor(score)];
  const displayScore = `${score}`;

  return (
    <View
      style={[
        styles.gauge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.blueTintLight,
        },
        style,
      ]}>
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: colors.blueTintLight,
          },
        ]}>
        <View
          style={[
            styles.ringFill,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderTopColor: color,
            },
          ]}
        />
      </View>
      <View style={styles.scoreContainer}>
        <Text style={[styles.score, {color}]}>
          {displayScore}%
        </Text>
        {label ? (
          <Text
            style={[
              styles.label,
              sublabelColor ? {color: sublabelColor} : null,
            ]}>
            {label}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gauge: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'solid',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  ringFill: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'solid',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    opacity: 0.15,
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    fontFamily: 'Inter',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textTertiary,
    lineHeight: 12,
    fontFamily: 'Inter',
    marginTop: 2,
  },
});
