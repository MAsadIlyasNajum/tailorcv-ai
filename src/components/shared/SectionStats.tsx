import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, typography, spacing, borderRadius} from '../../app/theme/designTokens';

interface SectionStatsProps {
  sectionCount: number;
  visibleCount: number;
  lastUpdated?: string;
  style?: object;
}

export const SectionStats = ({
  sectionCount,
  visibleCount,
  lastUpdated,
  style,
}: SectionStatsProps): React.JSX.Element => (
  <View style={[styles.container, style]}>
    <View>
      <Text style={styles.value}>{sectionCount}</Text>
      <Text style={styles.label}>Sections</Text>
    </View>
    <View style={styles.divider} />
    <View>
      <Text style={styles.value}>{visibleCount}</Text>
      <Text style={styles.label}>Visible</Text>
    </View>
    {lastUpdated ? (
      <>
        <View style={styles.divider} />
        <View style={styles.updated}>
          <Text style={styles.label}>Last updated</Text>
          <Text style={styles.updatedValue} numberOfLines={1}>{lastUpdated}</Text>
        </View>
      </>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  value: {
    ...typography.h3,
    color: colors.primaryDark,
  },
  label: {
    ...typography.labelSm,
    color: colors.textTertiary,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  updated: {
    flex: 1,
  },
  updatedValue: {
    ...typography.bodySemi,
    color: colors.textPrimary,
  },
});
