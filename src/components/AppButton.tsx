import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {colors, shadows} from '../app/theme/designTokens';

type ButtonMode = 'contained' | 'outlined' | 'text';

interface AppButtonProps {
  label?: string;
  onPress: () => void;
  mode?: ButtonMode;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textColor?: string;
  bgColor?: string;
  labelStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  compact?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
}

export const AppButton = ({
  label,
  onPress,
  mode = 'contained',
  disabled = false,
  loading = false,
  icon,
  fullWidth = true,
  style,
  textColor,
  bgColor,
  labelStyle,
  children,
  compact = false,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
}: AppButtonProps): React.JSX.Element => {
  const isDisabled = disabled || loading;

  const buttonStyle = [
    styles.base,
    fullWidth && styles.fullWidth,
    mode === 'contained' && styles.contained,
    mode === 'outlined' && styles.outlined,
    mode === 'text' && styles.text,
    compact && styles.compact,
    isDisabled && styles.disabled,
    bgColor && {backgroundColor: bgColor},
  ];

  const textStyle = [
    styles.textBase,
    mode === 'contained' && styles.containedText,
    mode === 'outlined' && styles.outlinedText,
    mode === 'text' && styles.textModeText,
    isDisabled && styles.disabledText,
    textColor && {color: textColor},
    labelStyle,
  ];

  const content = loading ? (
    <  ActivityIndicator
      animating
      size="small"
      color={mode === 'contained' ? '#FFFFFF' : '#004AC6'}
    />
  ) : (
    <>
      {icon ? (
        <View style={styles.icon}>
          {typeof icon === 'string' ? <Text>{icon}</Text> : icon}
        </View>
      ) : null}
      <Text style={textStyle}>{label ?? children}</Text>
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole as any}
      style={({pressed}) => [
        buttonStyle,
        pressed && styles.pressed,
        style,
      ]}>
      <View style={styles.contentRow}>{content}</View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fullWidth: {
    width: '100%',
  },
  contained: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
    ...shadows.card,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderColor: colors.primaryDark,
  },
  text: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 8,
    minHeight: 40,
  },
  compact: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    minHeight: 36,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.85,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },
  textBase: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    fontFamily: 'Inter',
    letterSpacing: -0.07,
  },
  containedText: {
    color: colors.surface,
  },
  outlinedText: {
    color: colors.primaryDark,
  },
  textModeText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.12,
    color: colors.primaryDark,
  },
  disabledText: {
    color: colors.textTertiary,
  },
});
