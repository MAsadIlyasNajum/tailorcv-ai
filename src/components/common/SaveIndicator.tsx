import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {colors} from '../../app/theme/designTokens';

interface SaveIndicatorProps {
  visible: boolean;
}

export const SaveIndicator = ({visible}: SaveIndicatorProps): React.JSX.Element | null => {
  if (!visible) return null;
  return (
    <Text
      accessible
      accessibilityLabel="Saved"
      accessibilityHint="Your changes have been saved"
      style={styles.saved}>
      Saved ✓
    </Text>
  );
};

const styles = StyleSheet.create({
  saved: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
    fontFamily: 'Inter',
  },
});
