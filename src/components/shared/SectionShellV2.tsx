import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, typography, spacing, borderRadius} from '../app/theme/designTokens';

interface SectionShellV2Props {
  title: string;
  subtitle?: string;
  action?: {label: string; onPress: () => void};
  children: React.ReactNode;
  style?: any;
}

export const SectionShellV2 = ({title, subtitle, action, children, style}: SectionShellV2Props): React.JSX.Element => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {action ? (
          <Pressable onPress={action.onPress} style={styles.actionBtn}>
            <Text style={styles.actionText}>{action.label}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 2,
  },
  actionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  actionText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default SectionShellV2;