import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, typography, spacing} from '../app/theme/designTokens';

interface TabItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  focusedIcon?: React.ReactNode;
  badge?: string;
  pro?: boolean;
}

interface BottomTabBarProps {
  items: TabItem[];
  activeKey: string;
  onNavigate: (key: string) => void;
}

export const BottomTabBar = ({items, activeKey, onNavigate}: BottomTabBarProps): React.JSX.Element => {
  return (
    <View style={styles.container}>
      {items.map(item => {
        const isActive = item.key === activeKey;
        const color = isActive ? colors.primaryDark : colors.textTertiary;
        return (
          <Pressable
            key={item.key}
            onPress={() => onNavigate(item.key)}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{selected: isActive}}>
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              {item.icon}
              {item.pro ? <View style={styles.proBadge} /> : null}
              {item.badge ? <View style={styles.badge} /> : null}
            </View>
            <Text style={[styles.label, {color}]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconWrapActive: {},
  proBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: colors.violet,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.red,
  },
  label: {
    ...typography.navLabel,
    fontSize: 11,
    fontWeight: '600',
  },
});

export default BottomTabBar;