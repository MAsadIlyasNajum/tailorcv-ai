import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AppButton} from '../index';
import type {ResumeSection, SectionType} from '../../types/resume';
import {DEFAULT_SECTION_LABELS} from '../../utils/resume/sectionFactory';
import {editorColors, editorStyles} from './styles';

interface SectionAdderProps {
  sections: ResumeSection[];
  onAdd: (type: SectionType, title?: string) => void;
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

const PRESET_CUSTOM_SECTIONS = [
  'Languages',
  'Awards',
  'Publications',
  'Volunteer Experience',
] as const;

export const SectionAdder = ({sections, onAdd}: SectionAdderProps): React.JSX.Element | null => {
  const presentSingletons = new Set(
    sections.filter(s => SINGLETON_TYPES.includes(s.type)).map(s => s.type),
  );

  const available = [
    ...SINGLETON_TYPES.filter(type => !presentSingletons.has(type)),
    ...REPEATABLE_TYPES,
  ];

  const existingTitles = new Set(
    sections.filter(s => s.type === 'custom' && s.title).map(s => s.title!.toLowerCase()),
  );

  if (available.length === 0 && PRESET_CUSTOM_SECTIONS.every(title => existingTitles.has(title.toLowerCase()))) {
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
      {PRESET_CUSTOM_SECTIONS.some(title => !existingTitles.has(title.toLowerCase())) && (
        <>
          <Text style={styles.subheading}>More sections</Text>
          <View style={styles.chips}>
            {PRESET_CUSTOM_SECTIONS.map(title => (
              <AppButton
                key={title}
                mode="outlined"
                compact
                disabled={existingTitles.has(title.toLowerCase())}
                onPress={() => onAdd('custom', title)}>
                + {title}
              </AppButton>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: editorColors.border,
  },
  heading: {
    fontSize: 15,
    fontWeight: '700',
    color: editorColors.text,
  },
  subheading: {
    fontSize: 13,
    fontWeight: '600',
    color: editorColors.muted,
    marginTop: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
