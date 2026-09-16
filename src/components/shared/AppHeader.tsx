import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, typography, spacing, borderRadius, shadows} from '../app/theme/designTokens';
import {IconSymbol} from './IconSymbol';

interface AppHeaderProps {
  title?: string;
  leftIcon?: React.ReactNode;
  onLeftPress?: () => void;
  rightIcon?: React.ReactNode;
  onRightPress?: () => void;
  subtitle?: string;
  variant?: 'default' | 'transparent' | 'glass';
  style?: any;
}

export const AppHeader = ({
  title,
  leftIcon,
  onLeftPress,
  rightIcon,
  subtitle,
  variant = 'default',
  style,
}: AppHeaderProps): React.JSX.Element => {
  const bg = variant === 'transparent' ? 'transparent' : colors.surface;
  const showShadow = variant !== 'transparent';

  const defaultLeft = leftIcon ?? (
    <IconSymbol name="back" size={20} color={colors.textPrimary} />
  );

  return (
    <View style={[styles.header, {backgroundColor: bg}, showShadow && shadows.header, style]}>
      <View style={styles.row}>
        {onLeftPress ? (
          <Pressable onPress={onLeftPress} style={styles.actionButton} hitSlop={8}>
            {leftIcon ?? defaultLeft}
          </Pressable>
        ) : (
          <View style={styles.actionButton} />
        )}
        <View style={styles.titleContainer}>
          {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text>}
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>
        {rightIcon ? (
          <Pressable onPress={onRightPress} style={styles.actionButton} hitSlop={8}>
            {rightIcon}
          </Pressable>
        ) : (
          <View style={styles.actionButton} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    height: 56,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  title: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textTertiary,
    marginTop: 2,
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppHeader;