import React from 'react';
import {StyleProp, StyleSheet, Text, TextInput, View, ViewStyle} from 'react-native';

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
}: AppTextInputProps): React.JSX.Element => {
  const minHeight = multiline ? (numberOfLines || 3) * 24 : dense ? 40 : 56;

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        multiline={multiline}
        numberOfLines={numberOfLines}
        editable={!disabled}
        autoFocus={autoFocus}
        onSubmitEditing={onSubmitEditing}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        textAlignVertical={textAlignVertical}
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
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
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
    color: '#94A3B8',
  },
});
