import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, typography, spacing, borderRadius} from '../../app/theme/designTokens';

interface ToastProps {
  visible: boolean;
  message: string;
  subtitle?: string;
  type?: 'success' | 'error' | 'info';
}

export const Toast = ({
  visible,
  message,
  subtitle,
  type = 'info',
}: ToastProps): React.JSX.Element | null => {
  if (!visible) return null;

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.toast,
        type === 'success' && styles.successToast,
        type === 'error' && styles.errorToast,
      ]}>
      <View style={[styles.icon, type === 'success' && styles.successIcon, type === 'error' && styles.errorIcon]}>
        <Text style={styles.iconText}>{type === 'success' ? '✓' : type === 'error' ? '!' : 'i'}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.message}>{message}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 80,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.overlayStrong,
    elevation: 8,
    shadowColor: colors.shadowColor,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1000,
  },
  successToast: {
    borderWidth: 0,
  },
  errorToast: {
    borderWidth: 1,
    borderColor: colors.redLight,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.borderStrong,
  },
  successIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: colors.greenLight,
  },
  errorIcon: {
    backgroundColor: colors.redLight,
  },
  iconText: {
    ...typography.badge,
    color: colors.overlayStrong,
  },
  copy: {
    flex: 1,
    gap: spacing.xxs,
  },
  message: {
    ...typography.badge,
    color: colors.surface,
    fontWeight: '600',
  },
  subtitle: {
    ...typography.body,
    color: '#EEECFF',
    opacity: 0.8,
  },
});

export default Toast;
