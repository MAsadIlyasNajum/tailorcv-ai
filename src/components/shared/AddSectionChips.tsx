import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, typography, spacing} from '../../app/theme/designTokens';

interface AddSectionChipsProps {
  sections: {label: string; icon?: string}[];
  onAdd: (label: string) => void;
  style?: any;
}

export const AddSectionChips = ({sections, onAdd, style}: AddSectionChipsProps): React.JSX.Element => {
  return (
    <View style={[styles.container, style]}>
      {sections.map((section, idx) => (
        <Pressable
          key={idx}
          onPress={() => onAdd(section.label)}
          style={styles.chip}>
          <Text style={styles.chipIcon}>{section.icon || '+'}</Text>
          <Text style={styles.chipText}>Add {section.label}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryTintLight,
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  chipIcon: {
    color: colors.primary,
    fontSize: 14,
  },
  chipText: {
    ...typography.body,
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default AddSectionChips;