import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors} from '../../app/theme/designTokens';

interface ProBadgeProps {
  size?: 'sm' | 'md';
  style?: any;
}

export const ProBadge = ({size = 'md', style}: ProBadgeProps): React.JSX.Element => {
  const isSm = size === 'sm';
  return (
    <View style={[styles.badge, isSm && styles.sm, style]}>
      <Text style={[styles.text, isSm && styles.smText]}>PRO</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.violet,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sm: {
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  text: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter',
    lineHeight: 10,
  },
  smText: {
    fontSize: 8,
    lineHeight: 9,
  },
});

export default ProBadge;