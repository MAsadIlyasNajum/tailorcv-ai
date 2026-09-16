import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, typography, spacing, borderRadius} from '../app/theme/designTokens';

interface ChecklistItem {
  label: string;
  completed: boolean;
}

interface FeatureChecklistProps {
  items: ChecklistItem[];
  style?: any;
}

export const FeatureChecklist = ({items, style}: FeatureChecklistProps): React.JSX.Element => {
  const completed = items.filter(i => i.completed).length;
  const total = items.length;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Feature Checklist</Text>
        <Text style={styles.progress}>{completed}/{total}</Text>
      </View>
      <View style={styles.bar}>
        <View style={[styles.barFill, {width: `${(completed / total) * 100}%`}]} />
      </View>
      <View style={styles.itemsList}>
        {items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <View style={[styles.check, item.completed && styles.checkDone]}>
              {item.completed ? <Text style={styles.checkIcon}>✓</Text> : null}
            </View>
            <Text style={[styles.itemLabel, item.completed && styles.itemDone]}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...{
      shadowColor: colors.shadowColor,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  progress: {
    ...typography.badge,
    color: colors.primary,
    fontWeight: '700',
  },
  bar: {
    height: 6,
    backgroundColor: colors.primaryTintLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  itemsList: {
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primaryTintLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: {
    backgroundColor: colors.green,
  },
  checkIcon: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  itemLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  itemDone: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

export default FeatureChecklist;