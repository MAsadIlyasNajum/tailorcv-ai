import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AppButton} from '../index';
import type {ResumeSection, SectionType} from '../../types/resume';
import {DEFAULT_SECTION_LABELS} from '../../utils/resume/sectionFactory';
import {editorColors, editorStyles} from './styles';

interface SectionAdderProps {
  sections: ResumeSection[];
  onAdd: (type: SectionType) => void;
}

const REPEATABLE_TYPES: SectionType[] = [
  'experience',
  'projects',
  'education',
  'skills',
  'certifications',
  'custom',
];

const SINGLETON_TYPES: SectionType[] = ['personalInfo', 'intro'];

export const SectionAdder = ({sections, onAdd}: SectionAdderProps): React.JSX.Element | null => {
  const presentSingletons = new Set(
    sections.filter(s => SINGLETON_TYPES.includes(s.type)).map(s => s.type),
  );

  const available = [
    ...SINGLETON_TYPES.filter(type => !presentSingletons.has(type)),
    ...REPEATABLE_TYPES,
  ];

  if (available.length === 0) {
    return null;
  }

  return (
    <View style={[editorStyles.card, styles.wrapper]}>
      <Text style={styles.heading}>Add section</Text>
      <View style={styles.chips}>
        {available.map(type => (
          <AppButton key={type} mode="outlined" compact onPress={() => onAdd(type)}>
            + {DEFAULT_SECTION_LABELS[type]}
          </AppButton>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  heading: {
    fontSize: 15,
    fontWeight: '700',
    color: editorColors.text,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
