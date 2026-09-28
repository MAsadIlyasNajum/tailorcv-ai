import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, typography, spacing} from '../../app/theme/designTokens';

interface AiTipsPillProps {
  tips: string[];
  style?: any;
}

export const AiTipsPill = ({tips, style}: AiTipsPillProps): React.JSX.Element | null => {
  if (!tips || tips.length === 0) return null;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.badge}>
        <Text style={styles.badgeIcon}>✦</Text>
        <Text style={styles.badgeText}>AI Tips</Text>
      </View>
      <View style={styles.tipsList}>
        {tips.map((tip, idx) => (
          <Pressable key={idx} style={styles.tipPill}>
            <Text style={styles.tipText} numberOfLines={2}>{tip}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.violetTint,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
    alignSelf: 'flex-start',
  },
  badgeIcon: {
    color: colors.violet,
    fontSize: 12,
  },
  badgeText: {
    ...typography.badge,
    color: colors.violet,
    fontWeight: '700',
  },
  tipsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tipPill: {
    backgroundColor: colors.violetTint,
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tipText: {
    ...typography.body,
    fontSize: 13,
    color: colors.violet,
  },
});

export default AiTipsPill;