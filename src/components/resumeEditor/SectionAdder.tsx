import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AppButton} from '../index';
import type {ResumeSection, SectionType} from '../../types/resume';
import {DEFAULT_SECTION_LABELS} from '../../utils/resume/sectionFactory';
import {editorColors} from './styles';

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
    <View style={styles.wrapper}>
      <Text style={styles.heading}>Available Sections</Text>
      <Text style={styles.subtitle}>Tap to add</Text>
      <View style={styles.chips}>
        {available.map(type => (
          <AppButton
            key={type}
            mode="outlined"
            compact
            labelStyle={styles.chipLabel}
            onPress={() => onAdd(type)}
            style={styles.chipButton}>
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
                labelStyle={styles.chipLabel}
                disabled={existingTitles.has(title.toLowerCase())}
                onPress={() => onAdd('custom', title)}
                style={styles.chipButton}>
                + {title}
              </AppButton>
            ))}
          </View>
        </>
      )}
      <AppButton
        mode="text"
        fullWidth
        label="+ Add Custom Section"
        onPress={() => onAdd('custom')}
        style={styles.customButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  heading: {
    fontSize: 14,
    fontWeight: '600',
    color: editorColors.text,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: editorColors.muted,
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
  chipButton: {
    minHeight: 36,
    borderRadius: 9999,
    backgroundColor: editorColors.surface,
    borderColor: editorColors.surface,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  customButton: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#F2F3FF',
    borderColor: '#F2F3FF',
  },
});
