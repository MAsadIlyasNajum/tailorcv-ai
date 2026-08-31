import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';

interface AppDividerProps {
  style?: StyleProp<ViewStyle>;
}

export const AppDivider = ({style}: AppDividerProps): React.JSX.Element => {
  return <View style={[styles.divider, style]} />;
};

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
});
