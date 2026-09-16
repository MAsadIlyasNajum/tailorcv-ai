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
  mode?: 'contained' | 'outlined' | 'text';
  bgColor?: string;
  textColor?: string;
}

export const PrimaryButton = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  mode = 'contained',
  bgColor,
  textColor,
}: PrimaryButtonProps): React.JSX.Element => {
  const isDisabled = disabled || loading;

  return (
    <View style={[styles.wrapper, !fullWidth && styles.inlineWrapper]}>
      <AppButton
        label={label}
        onPress={onPress}
        mode={mode}
        disabled={isDisabled}
        loading={loading}
        icon={icon}
        fullWidth={fullWidth}
        textColor={textColor}
        style={bgColor ? {backgroundColor: bgColor} : undefined}
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

