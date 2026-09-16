import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, typography, spacing, borderRadius} from '../app/theme/designTokens';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
}

export const Toast = ({visible, message, type = 'info'}: ToastProps): React.JSX.Element | null => {
  if (!visible) return null;

  const bg = type === 'success' ? colors.greenStrong : type === 'error' ? colors.redStrong : colors.overlayStrong;

  return (
    <View style={[styles.toast, {backgroundColor: bg}]}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 80,
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    elevation: 8,
    shadowColor: colors.shadowColor,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1000,
  },
  message: {
    color: colors.surface,
    ...typography.body,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Toast;