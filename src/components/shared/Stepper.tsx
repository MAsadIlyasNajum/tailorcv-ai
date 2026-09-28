import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, typography, spacing, shadows} from '../../app/theme/designTokens';

interface Step {
  label: string;
  completed?: boolean;
  current?: boolean;
}

interface StepperProps {
  steps: Step[];
  style?: any;
}

export const Stepper = ({steps, style}: StepperProps): React.JSX.Element => {
  return (
    <View style={[styles.container, style]}>
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        const isCompleted = step.completed;
        const isCurrent = step.current;

        return (
          <View key={idx} style={styles.step}>
            <View style={styles.stepHeader}>
              <View style={[styles.dot, isCompleted && styles.dotDone, isCurrent && styles.dotCurrent, !isCompleted && !isCurrent && styles.dotFuture]}>
                {isCompleted ? <Text style={[styles.dotIcon, styles.dotIconDone]}>✓</Text> : null}
                {isCurrent && !isCompleted ? <Text style={styles.dotIcon}>●</Text> : null}
              </View>
              <Text style={[styles.stepLabel, isCompleted && styles.stepLabelDone, isCurrent && styles.stepLabelCurrent]}>{step.label}</Text>
            </View>
            {!isLast ? <View style={[styles.connector, isCompleted && styles.connectorDone]} /> : null}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    ...shadows.card,
  },
  step: {
    flex: 1,
    alignItems: 'center',
  },
  stepHeader: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 9999,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    backgroundColor: colors.greenLight,
  },
  dotCurrent: {
    backgroundColor: colors.primaryDark,
  },
  dotFuture: {
    backgroundColor: colors.border,
  },
  dotIcon: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
  dotIconDone: {
    color: colors.greenStrong,
  },
  stepLabel: {
    ...typography.badge,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  stepLabelCurrent: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  stepLabelDone: {
    color: colors.textPrimary,
  },
  connector: {
    width: '100%',
    height: 2,
    backgroundColor: colors.border,
    marginTop: 14,
  },
  connectorDone: {
    backgroundColor: colors.greenLight,
  },
});

export default Stepper;