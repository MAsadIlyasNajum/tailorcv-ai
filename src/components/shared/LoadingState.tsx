import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {colors, typography, spacing} from '../app/theme/designTokens';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
}

export const LoadingState = ({message, size = 'large'}: LoadingStateProps): React.JSX.Element => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl3,
    gap: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.textTertiary,
  },
});

export default LoadingState;