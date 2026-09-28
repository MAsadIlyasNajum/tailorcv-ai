import React from 'react';
import {StyleProp, StyleSheet, Text, TextInput, View, ViewStyle} from 'react-native';
import {colors} from '../app/theme/designTokens';

interface AppTextInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  dense?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center';
  label?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
}

export const AppTextInput = ({
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  dense = false,
  disabled = false,
  style,
  autoFocus,
  onSubmitEditing,
  autoCapitalize = 'none',
  autoCorrect = false,
  textAlignVertical = 'auto',
  label,
  accessibilityHint,
  accessibilityRole,
}: AppTextInputProps): React.JSX.Element => {
  const minHeight = multiline ? (numberOfLines || 3) * 24 : dense ? 40 : 48;

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textQuaternary}
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={!disabled}
        autoFocus={autoFocus}
        onSubmitEditing={onSubmitEditing}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        textAlignVertical={textAlignVertical}
        accessible={!!label}
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole as any}
        style={[
          styles.input,
          multiline && styles.multiline,
          dense && styles.dense,
          {minHeight},
          disabled && styles.disabled,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
    fontFamily: 'Inter',
  },
  input: {
    backgroundColor: colors.surfaceTint,
    borderWidth: 0,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: 'Inter',
  },
  multiline: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  dense: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  disabled: {
    backgroundColor: '#F1F5F9',
    color: colors.textQuaternary,
  },
});
