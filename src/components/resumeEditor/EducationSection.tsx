import React from 'react';
import {Switch, Text, View} from 'react-native';
import {AppTextInput} from '../index';
import type {EducationEntry, ResumeSection} from '../../types/resume';
import {SectionShell} from './SectionShell';
import {RepeatableSectionEditor} from './RepeatableSectionEditor';
import {RepeatableStrings} from './RepeatableStrings';
import {useEntryOps, useSectionOps} from './useResumeContent';
import {createEducationEntry, DEFAULT_SECTION_LABELS} from '../../utils/resume/sectionFactory';
import {editorStyles} from './styles';

interface SectionProps {
  resumeId: string;
  section: ResumeSection;
  index: number;
  count: number;
}

export const EducationSection = ({resumeId, section, index, count}: SectionProps): React.JSX.Element | null => {
  const ops = useSectionOps(resumeId, section, index, count);
  const entryOps = useEntryOps(resumeId, section.id);

  if (section.type !== 'education') {
    return null;
  }

  const title = section.title ?? DEFAULT_SECTION_LABELS.education;

  return (
    <SectionShell
      title={title}
      titleEditable={false}
      hidden={!section.visible}
      canMoveUp={ops.canMoveUp}
      canMoveDown={ops.canMoveDown}
      onMoveUp={ops.moveUp}
      onMoveDown={ops.moveDown}
      onToggleVisible={ops.toggleVisible}
      onRemove={ops.remove}>
      <RepeatableSectionEditor<EducationEntry>
        entries={section.entries}
        addLabel="Add education"
        emptyHint="No education entries yet."
        onAdd={() => entryOps.add(createEducationEntry(section.entries.length))}
        onUpdate={entryOps.updateEntry}
        onRemove={entryOps.remove}
        onDuplicate={entryOps.duplicate}
        onMove={entryOps.move}
        renderEntry={(entry, onChange) => (
          <View style={editorStyles.fieldGap}>
            <AppTextInput
              label="Institution"
              value={entry.institution ?? ''}
              onChangeText={value => onChange({institution: value})}
            />
            <View style={editorStyles.row}>
              <View style={editorStyles.flexField}>
                <AppTextInput
                  label="Degree"
                  value={entry.degree ?? ''}
                  onChangeText={value => onChange({degree: value})}
                />
              </View>
              <View style={editorStyles.flexField}>
                <AppTextInput
                  label="Field of study"
                  value={entry.fieldOfStudy ?? ''}
                  onChangeText={value => onChange({fieldOfStudy: value})}
                />
              </View>
            </View>
            <AppTextInput
              label="Location"
              value={entry.location ?? ''}
              onChangeText={value => onChange({location: value})}
            />
            <View style={editorStyles.row}>
              <View style={editorStyles.flexField}>
                <AppTextInput
                  label="Start date"
                  value={entry.startDate ?? ''}
                  onChangeText={value => onChange({startDate: value})}
                />
              </View>
              <View style={editorStyles.flexField}>
                <AppTextInput
                  label="End date"
                  value={entry.endDate ?? ''}
                  onChangeText={value => onChange({endDate: value})}
                  disabled={entry.isCurrent}
                />
              </View>
            </View>
            <View style={editorStyles.subRow}>
              <Text style={editorStyles.groupTitle}>Currently studying</Text>
              <Switch
                value={entry.isCurrent ?? false}
                onValueChange={value => onChange({isCurrent: value, endDate: value ? null : entry.endDate ?? ''})}
              />
            </View>
            <AppTextInput
              label="Description"
              value={entry.description ?? ''}
              onChangeText={value => onChange({description: value})}
              multiline
              numberOfLines={3}
            />
            <RepeatableStrings
              label="Achievements"
              values={entry.achievements ?? []}
              onChange={achievements => onChange({achievements})}
            />
            <AppTextInput
              label="GPA / grade (optional)"
              value={entry.gpa ?? ''}
              onChangeText={value => onChange({gpa: value})}
            />
            <RepeatableStrings
              label="Relevant coursework"
              values={entry.coursework ?? []}
              onChange={coursework => onChange({coursework})}
            />
            <RepeatableStrings
              label="Activities"
              values={entry.activities ?? []}
              onChange={activities => onChange({activities})}
            />
            <AppTextInput
              label="Institution URL"
              value={entry.url ?? ''}
              onChangeText={value => onChange({url: value})}
            />
          </View>
        )}
      />
    </SectionShell>
  );
};
