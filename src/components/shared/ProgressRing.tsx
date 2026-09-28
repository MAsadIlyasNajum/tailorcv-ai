import React from 'react';
import {StyleSheet, View} from 'react-native';
import {colors} from '../../app/theme/designTokens';

interface ProgressRingProps {
  /** 0-100 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  children?: React.ReactNode;
}

/**
 * Circular progress ring built from layered half-circle borders so the app does
 * not need an SVG dependency. Figma reference: 48px ring, #EAEDFF track,
 * #004AC6 progress arc, ~4.7 stroke.
 */
export const ProgressRing = ({
  progress,
  size = 48,
  strokeWidth = 4.5,
  trackColor = colors.primaryTintLighter,
  progressColor = colors.primaryDark,
  children,
}: ProgressRingProps): React.JSX.Element => {
  const clamped = Math.max(0, Math.min(100, progress));

  const ringStyles = React.useMemo(
    () =>
      StyleSheet.create({
        base: {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
        },
        track: {
          borderColor: trackColor,
        },
        rightHalf: {
          borderColor: progressColor,
          borderRightColor: 'transparent',
        },
        leftHalfFull: {
          borderColor: progressColor,
          borderLeftColor: 'transparent',
          borderBottomColor: progressColor,
        },
        leftHalfPartial: {
          borderColor: progressColor,
          borderLeftColor: 'transparent',
          borderBottomColor: 'transparent',
        },
        rotateRight: {
          transform: [{rotate: '180deg'}],
        },
      }),
    [size, strokeWidth, trackColor, progressColor],
  );

  return (
    <View style={[styles.ring, ringStyles.base, ringStyles.track]}>
      <View style={[styles.half, ringStyles.base, ringStyles.rightHalf]}>
        <View
          style={[
            styles.half,
            ringStyles.base,
            clamped > 50 ? ringStyles.leftHalfFull : ringStyles.leftHalfPartial,
            clamped > 50 ? ringStyles.rotateRight : styles.noRotation,
          ]}
        />
      </View>
      <View style={styles.label}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  half: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  noRotation: {
    transform: [{rotate: '0deg'}],
  },
  label: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProgressRing;
