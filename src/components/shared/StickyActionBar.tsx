import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, spacing, shadows} from '../../app/theme/designTokens';

interface StickyActionBarProps {
  children: React.ReactNode;
  style?: object;
}

export const StickyActionBar = ({children, style}: StickyActionBarProps): React.JSX.Element => (
  <View style={[styles.container, style]}>{children}</View>
);

interface StickyActionButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'primaryDark' | 'secondary' | 'violet';
  disabled?: boolean;
  style?: object;
  radius?: number;
  minHeight?: number;
  icon?: React.ReactNode;
}

export const StickyActionButton = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  radius,
  minHeight,
  icon,
}: StickyActionButtonProps): React.JSX.Element => (
  <Pressable
    accessibilityRole="button"
    accessibilityState={{disabled}}
    disabled={disabled}
    onPress={onPress}
    style={({pressed}) => [
      styles.button,
      radius === 8 && styles.radius8,
      minHeight !== undefined && {minHeight},
      variant === 'primary' && styles.primary,
      variant === 'primaryDark' && styles.primaryDark,
      variant === 'secondary' && styles.secondary,
      variant === 'violet' && styles.violet,
      disabled && styles.disabled,
      pressed && !disabled && styles.pressed,
      style,
    ]}>
    {icon}
    <Text
      style={[
        styles.label,
        variant === 'secondary' && styles.secondaryLabel,
        variant === 'violet' && styles.violetLabel,
      ]}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.90)',
    ...shadows.fab,
  },
  button: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  radius8: {
    borderRadius: 8,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  primaryDark: {
    backgroundColor: colors.primaryDark,
  },
  secondary: {
    backgroundColor: colors.primaryTintLighter,
  },
  violet: {
    backgroundColor: colors.violetTint,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: -0.07,
    color: colors.surface,
  },
  secondaryLabel: {
    color: colors.primaryDark,
  },
  violetLabel: {
    color: colors.amberText,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.82,
  },
});
