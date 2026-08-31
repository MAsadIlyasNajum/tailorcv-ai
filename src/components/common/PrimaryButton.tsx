import React from 'react';
import {StyleSheet, View} from 'react-native';
import {AppButton} from '../AppButton';

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
      <AppButton
        label={label}
        onPress={onPress}
        mode="contained"
        disabled={isDisabled}
        loading={loading}
        icon={icon}
        fullWidth={fullWidth}
      />
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
});
