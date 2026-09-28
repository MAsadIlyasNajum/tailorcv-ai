import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {colors, typography, spacing, borderRadius} from '../../app/theme/designTokens';
import {IconSymbol} from './IconSymbol';

interface SearchFilter {
  label: string;
  value: string;
}

interface SearchFilterBarProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  filters?: SearchFilter[];
  selectedFilter?: string;
  onSelectFilter?: (value: string) => void;
}

export const SearchFilterBar = ({
  value,
  onChangeText,
  placeholder = 'Search',
  filters = [],
  selectedFilter = 'all',
  onSelectFilter,
}: SearchFilterBarProps): React.JSX.Element => (
  <View style={styles.container}>
    <View style={styles.inputWrap}>
      <View style={styles.searchIcon}>
        <IconSymbol name="search" size={15} color={colors.textTertiary} />
      </View>
      <TextInput
        accessibilityLabel={placeholder}
        autoCapitalize="none"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        style={styles.input}
        value={value}
      />
    </View>
    {filters.length > 0 && onSelectFilter ? (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}>
        {filters.map(filter => {
          const selected = filter.value === selectedFilter;
          return (
            <Pressable
              key={filter.value}
              accessibilityRole="button"
              accessibilityLabel={filter.label}
              accessibilityState={{selected}}
              hitSlop={{top: 8, bottom: 8, left: 4, right: 4}}
              onPress={() => onSelectFilter(filter.value)}
              style={[styles.filter, selected && styles.filterSelected]}>
              <View style={styles.filterContent}>
                <View style={[styles.dot, selected && styles.dotSelected]} />
                <Text style={[styles.filterLabel, selected && styles.filterLabelSelected]}>
                  {filter.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  input: {
    ...typography.body,
    minHeight: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    paddingLeft: 40,
    paddingRight: spacing.lg,
    color: colors.textPrimary,
  },
  filters: {
    gap: spacing.sm,
  },
  filter: {
    minHeight: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryTintLighter,
    paddingHorizontal: 14,
    paddingVertical: 6,
    justifyContent: 'center',
  },
  filterSelected: {
    backgroundColor: colors.primaryDark,
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderAccent,
  },
  dotSelected: {
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.12,
    color: colors.textPrimary,
  },
  filterLabelSelected: {
    color: colors.surface,
  },
});
