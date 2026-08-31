import React from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';

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
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  compact: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1D4ED8',
    lineHeight: 18,
  },
  compactText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
