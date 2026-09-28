import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, typography, spacing, shadows} from '../../app/theme/designTokens';
import {ProBadge} from './ProBadge';
import {IconSymbol} from './IconSymbol';

interface ProLockedCardProps {
  title: string;
  description: string;
  lockedFeature?: string;
  onUpgrade?: () => void;
  style?: any;
}

export const ProLockedCard = ({title, description, lockedFeature, onUpgrade, style}: ProLockedCardProps): React.JSX.Element => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.lockedRow}>
        <IconSymbol name="lock" size={16} color={colors.violet} />
        <ProBadge size="sm" style={styles.proBadge} />
      </View>
      <Text style={styles.eyebrow}>PRO EXCLUSIVE CAPABILITY</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {lockedFeature ? <Text style={styles.lockedFeature}>Locked: {lockedFeature}</Text> : null}
      {onUpgrade ? (
        <Pressable onPress={onUpgrade} style={styles.upgradeBtn}>
          <Text style={styles.upgradeText}>Upgrade to Pro</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
    borderWidth: 0,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  proBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  eyebrow: {
    ...typography.labelSm,
    color: colors.amberText,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
  lockedFeature: {
    ...typography.badge,
    color: colors.textTertiary,
  },
  upgradeBtn: {
    backgroundColor: colors.primaryDark,
    borderRadius: 8,
    minHeight: 44,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  upgradeText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
});

export default ProLockedCard;