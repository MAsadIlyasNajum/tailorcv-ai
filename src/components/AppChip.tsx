import React from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {colors} from '../app/theme/designTokens';

interface AppChipProps {
  children: React.ReactNode;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const AppChip = ({children, compact = false, style}: AppChipProps): React.JSX.Element => {
  return (
    <View style={[styles.chip, compact && styles.compact, style]}>
      <Text style={[styles.text, compact && styles.compactText]}>{children}</Text>
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
});
