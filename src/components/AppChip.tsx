import React from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {colors} from '../app/theme/designTokens';

interface AppChipProps {
  children: React.ReactNode;
  compact?: boolean;
  tone?: 'default' | 'success' | 'danger';
  style?: StyleProp<ViewStyle>;
}

export const AppChip = ({children, compact = false, tone = 'default', style}: AppChipProps): React.JSX.Element => {
  return (
    <View style={[styles.chip, compact && styles.compact, tone === 'success' && styles.success, tone === 'danger' && styles.danger, style]}>
      <Text style={[styles.text, compact && styles.compactText, tone === 'success' && styles.successText, tone === 'danger' && styles.dangerText]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.blueTint,
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.blueTintLight,
  },
  compact: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  success: {
    backgroundColor: colors.greenTint,
    borderColor: colors.greenTint,
  },
  danger: {
    backgroundColor: colors.redTint,
    borderColor: colors.redTint,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
    lineHeight: 18,
    fontFamily: 'Inter',
  },
  compactText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Inter',
  },
  successText: {
    color: colors.greenText,
  },
  dangerText: {
    color: colors.redText,
  },
});
