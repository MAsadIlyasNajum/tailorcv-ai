import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, typography, spacing, borderRadius} from '../../app/theme/designTokens';

interface TabOption {
  key: string;
  label: string;
}

interface TabSwitcherProps {
  options: TabOption[];
  activeKey: string;
  onChange: (key: string) => void;
}

export const TabSwitcher = ({options, activeKey, onChange}: TabSwitcherProps): React.JSX.Element => {
  return (
    <View style={styles.container}>
      {options.map(option => {
        const isActive = option.key === activeKey;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            style={[styles.tab, isActive && styles.tabActive]}
            accessibilityRole="tab"
            accessibilityState={{selected: isActive}}>
            <Text style={[styles.label, isActive && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.primaryTintLight,
    borderRadius: borderRadius.md,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.surface,
    elevation: 1,
    shadowColor: colors.shadowColor,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  label: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  labelActive: {
    color: colors.textPrimary,
  },
});

export default TabSwitcher;