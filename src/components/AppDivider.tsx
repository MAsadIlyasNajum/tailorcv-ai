import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import {colors} from '../app/theme/designTokens';

interface AppDividerProps {
  style?: StyleProp<ViewStyle>;
}

export const AppDivider = ({style}: AppDividerProps): React.JSX.Element => {
  return <View style={[styles.divider, style]} />;
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
});
