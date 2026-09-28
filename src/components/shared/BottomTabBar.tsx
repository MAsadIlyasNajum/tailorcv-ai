import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, typography} from '../../app/theme/designTokens';

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
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, {height: 64 + insets.bottom, paddingBottom: Math.max(insets.bottom, 8)}]}>
      {items.map(item => {
        const isActive = item.key === activeKey;
        const color = isActive ? colors.primaryDark : colors.textSecondary;
        return (
          <Pressable
            key={item.key}
            onPress={() => onNavigate(item.key)}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{selected: isActive}}>
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              {isActive ? item.focusedIcon ?? item.icon : item.icon}
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
    backgroundColor: 'rgba(255,255,255,0.90)',
    shadowColor: colors.shadowColor,
    shadowOffset: {width: 0, height: -1},
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 6,
    height: 64,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconWrap: {
    width: 18,
    height: 18,
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