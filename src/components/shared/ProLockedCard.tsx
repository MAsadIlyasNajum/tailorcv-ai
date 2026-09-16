import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, typography, spacing, borderRadius, shadows} from '../app/theme/designTokens';
import {ProBadge} from './ProBadge';

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
        <Text style={styles.lockedIcon}>🔒</Text>
        <ProBadge size="sm" style={styles.proBadge} />
      </View>
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
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  lockedIcon: {
    fontSize: 16,
  },
  proBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  title: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '700',
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
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  upgradeText: {
    color: colors.surface,
    ...typography.body,
    fontWeight: '600',
  },
});

export default ProLockedCard;