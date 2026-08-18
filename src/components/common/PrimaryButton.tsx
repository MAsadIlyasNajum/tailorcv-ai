import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, ActivityIndicator} from 'react-native-paper';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const PrimaryButton = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
}: PrimaryButtonProps): React.JSX.Element => {
  const isDisabled = disabled || loading;

  return (
    <View style={[styles.wrapper, !fullWidth && styles.inlineWrapper]}>
      <Button
        mode="contained"
        onPress={onPress}
        disabled={isDisabled}
        contentStyle={styles.content}
        style={styles.button}
        labelStyle={styles.label}>
        {loading ? (
          <ActivityIndicator animating size={16} color="#FFFFFF" />
        ) : (
          <View style={styles.row}>
            {icon ? <View style={styles.iconSlot}>{icon}</View> : null}
            {label}
          </View>
        )}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  inlineWrapper: {
    width: 'auto',
    alignSelf: 'flex-start',
  },
  button: {
    borderRadius: 12,
  },
  content: {
    minHeight: 50,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
