import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

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
  children?: React.ReactNode;
  compact?: boolean;
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
  children,
  compact = false,
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
  ];

  const textStyle = [
    styles.textBase,
    mode === 'contained' && styles.containedText,
    mode === 'outlined' && styles.outlinedText,
    mode === 'text' && styles.textModeText,
    isDisabled && styles.disabledText,
    textColor && {color: textColor},
  ];

  const content = loading ? (
    <ActivityIndicator
      animating
      size="small"
      color={mode === 'contained' ? '#FFFFFF' : '#2563EB'}
    />
  ) : (
    <>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={textStyle}>{label ?? children}</Text>
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fullWidth: {
    width: '100%',
  },
  contained: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  outlined: {
    backgroundColor: 'transparent',
    borderColor: '#2563EB',
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
    minHeight: 32,
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
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  containedText: {
    color: '#FFFFFF',
  },
  outlinedText: {
    color: '#2563EB',
  },
  textModeText: {
    color: '#2563EB',
  },
  disabledText: {
    color: '#64748B',
  },
});
