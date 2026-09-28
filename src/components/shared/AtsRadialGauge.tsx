import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors} from '../../app/theme/designTokens';

const SCORE_COLOR: Record<string, string> = {
  green: colors.greenStrong,
  blue: colors.primaryDark,
  violet: colors.violet,
  red: colors.redStrong,
};

const resolveColor = (score: number): string => {
  if (score >= 80) return SCORE_COLOR.green;
  if (score >= 60) return SCORE_COLOR.blue;
  if (score >= 40) return SCORE_COLOR.violet;
  return SCORE_COLOR.red;
};

const clamp = (v: number): number => Math.max(0, Math.min(100, v));

interface AtsRadialGaugeProps {
  score: number;
  size?: number;
  showLabel?: boolean;
  fontSize?: number;
  color?: string;
  style?: any;
}

export const AtsRadialGauge = ({
  score,
  size = 48,
  showLabel = true,
  fontSize = 12,
  color,
  style,
}: AtsRadialGaugeProps): React.JSX.Element => {
  const clamped = clamp(score);
  const strokeColor = color ?? resolveColor(clamped);
  const half = clamped / 2;
  const fullRotations = Math.floor(half / 50);
  const remainder = half % 50;
  const rotation = fullRotations * 180 + (remainder / 50) * 180;

  return (
    <View style={[styles.gauge, {width: size, height: size}, style]}>
      <View style={[styles.ring, {width: size, height: size, borderRadius: size / 2}]}>
        <View style={styles.track} />
        <View style={styles.halfTrack} />
        <View
          style={[
            styles.halfFill,
            styles.halfFillBorder,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderLeftColor: strokeColor,
              transform: [{rotate: `${rotation}deg`}],
            },
          ]}
        />
      </View>
      {showLabel ? (
        <View style={styles.labelContainer}>
          <Text style={[styles.score, {fontSize, color: strokeColor}]}>{clamped}</Text>
        </View>
      ) : null}
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
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  track: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    backgroundColor: colors.borderAccent,
  },
  halfTrack: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: '50%',
    height: '100%',
    backgroundColor: colors.borderAccent,
    transform: [{translateX: '-50%'}],
  },
  halfFill: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  halfFillBorder: {
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderStyle: 'solid',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontWeight: '700',
    fontFamily: 'Inter',
    lineHeight: 16,
  },
});

export default AtsRadialGauge;