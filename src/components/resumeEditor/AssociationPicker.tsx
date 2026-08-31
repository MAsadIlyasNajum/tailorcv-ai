import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AppButton} from '../index';
import {useResumeStore} from '../../store/useResumeStore';
import type {SectionType} from '../../types/resume';
import {editorStyles} from './styles';

interface AssociationPickerProps {
  resumeId: string;
  /** The section type whose entries can be associated. */
  targetType: Extract<SectionType, 'projects' | 'experience'>;
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export const AssociationPicker = ({
  resumeId,
  targetType,
  selectedIds,
  onToggle,
}: AssociationPickerProps): React.JSX.Element => {
  const target = useResumeStore(state => {
    const resume = state.resumes.find(r => r.id === resumeId);
    return resume?.content?.sections.find(s => s.type === targetType) ?? null;
  });

  const label = targetType === 'projects' ? 'Projects' : 'Experiences';

  if (!target || !('entries' in target) || target.entries.length === 0) {
    return (
      <View style={editorStyles.fieldGap}>
        <Text style={editorStyles.groupTitle}>Associated {label}</Text>
        <Text style={editorStyles.emptyHint}>
          Add {label.toLowerCase()} first to associate them here.
        </Text>
      </View>
    );
  }

  const entries = target.entries as Array<{
    id: string;
    name?: string;
    company?: string;
    role?: string;
  }>;

  return (
    <View style={editorStyles.fieldGap}>
      <Text style={editorStyles.groupTitle}>Associated {label} (optional)</Text>
      <View style={styles.chips}>
        {entries.map(entry => {
          const id = entry.id;
          const selected = selectedIds.includes(id);
          const title = entry.name || entry.company || entry.role || 'Untitled';
          return (
            <AppButton
              key={id}
              mode={selected ? 'contained' : 'outlined'}
              compact
              onPress={() => onToggle(id)}>
              {selected ? '✓ ' : '+ '}
              {title}
            </AppButton>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
