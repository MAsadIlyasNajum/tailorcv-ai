import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors} from '../../app/theme/designTokens';

interface MetricItem {
  value: string;
  label: string;
}

interface MetricPillProps {
  items: MetricItem[];
  style?: object;
}

export const MetricPill = ({items, style}: MetricPillProps): React.JSX.Element => {
  return (
    <View style={[styles.pill, style]}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <View key={index} style={styles.item}>
            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.label}>{item.label}</Text>
            {!isLast && <Text style={styles.separator}>•</Text>}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    backgroundColor: colors.primaryTintLighter,
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  separator: {
    fontSize: 12,
    lineHeight: 20,
    color: colors.textTertiary,
    fontFamily: 'Inter',
  },
  value: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'Inter',
    lineHeight: 14,
    letterSpacing: 0.44,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    fontFamily: 'Inter',
    lineHeight: 14,
    letterSpacing: 0.44,
  },
});
