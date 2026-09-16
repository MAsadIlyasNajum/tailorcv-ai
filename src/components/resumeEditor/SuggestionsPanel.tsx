import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AppButton} from '../AppButton';
import {AppCard} from '../AppCard';
import type {OptimizationSuggestion} from '../../types/resume';

interface SuggestionsPanelProps {
  suggestions: OptimizationSuggestion[];
  onApply: (suggestion: OptimizationSuggestion) => void;
  onDismiss: (suggestion: OptimizationSuggestion) => void;
}

type FilterType = 'all' | 'high' | 'medium' | 'low';

export const SuggestionsPanel = ({
  suggestions,
  onApply,
  onDismiss,
}: SuggestionsPanelProps): React.JSX.Element | null => {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredSuggestions = useMemo(() => {
    if (filter === 'all') {
      return suggestions.filter(s => !s.applied);
    }
    return suggestions.filter(s => !s.applied && s.impact === filter);
  }, [suggestions, filter]);

  const appliedCount = suggestions.filter(s => s.applied).length;
  const totalCount = suggestions.length;

  if (totalCount === 0) {
    return null;
  }

  return (
    <AppCard style={styles.card}>
      <AppCard.Title title="Optimization Suggestions" subtitle={`${appliedCount} of ${totalCount} applied`} />
      <AppCard.Content>
        <View style={styles.filters}>
          <FilterChip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
          <FilterChip label="High" active={filter === 'high'} onPress={() => setFilter('high')} count={suggestions.filter(s => s.impact === 'high' && !s.applied).length} />
          <FilterChip label="Medium" active={filter === 'medium'} onPress={() => setFilter('medium')} count={suggestions.filter(s => s.impact === 'medium' && !s.applied).length} />
          <FilterChip label="Low" active={filter === 'low'} onPress={() => setFilter('low')} count={suggestions.filter(s => s.impact === 'low' && !s.applied).length} />
        </View>
        {filteredSuggestions.length === 0 ? (
          <Text style={styles.emptyText}>No suggestions matching this filter.</Text>
        ) : (
          <View style={styles.list}>
            {filteredSuggestions.map(suggestion => (
              <SuggestionItem
                key={suggestion.id}
                suggestion={suggestion}
                onApply={() => onApply(suggestion)}
                onDismiss={() => onDismiss(suggestion)}
              />
            ))}
          </View>
        )}
      </AppCard.Content>
    </AppCard>
  );
};

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  count?: number;
}

const FilterChip = ({label, active, onPress, count}: FilterChipProps): React.JSX.Element => (
  <AppButton
    mode={active ? 'contained' : 'outlined'}
    compact
    onPress={onPress}
    style={styles.filterChip}>
    {label}{count !== undefined && count > 0 ? ` (${count})` : ''}
  </AppButton>
);

interface SuggestionItemProps {
  suggestion: OptimizationSuggestion;
  onApply: () => void;
  onDismiss: () => void;
}

const SuggestionItem = ({suggestion, onApply, onDismiss}: SuggestionItemProps): React.JSX.Element => {
  const impactColor = suggestion.impact === 'high' ? '#DC2626' : suggestion.impact === 'medium' ? '#F59E0B' : '#64748B';

  return (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <View style={[styles.impactBadge, {backgroundColor: impactColor}]}>
          <Text style={styles.impactText}>{suggestion.impact.toUpperCase()}</Text>
        </View>
        <Text style={styles.sectionLabel}>{suggestion.section}</Text>
      </View>
      <Text style={styles.description}>{suggestion.description}</Text>
      <View style={styles.actions}>
        <AppButton mode="contained" compact onPress={onApply}>Apply</AppButton>
        <AppButton mode="text" compact onPress={onDismiss}>Dismiss</AppButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 14,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  filterChip: {
    minHeight: 32,
  },
  list: {
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 16,
  },
  item: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  impactBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  impactText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
});
