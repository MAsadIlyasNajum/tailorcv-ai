import React from 'react';
import {View} from 'react-native';
import {AppTextInput} from '../index';
import type {ProjectEntry, ResumeSection} from '../../types/resume';
import {SectionShell} from './SectionShell';
import {RepeatableSectionEditor} from './RepeatableSectionEditor';
import {RepeatableStrings} from './RepeatableStrings';
import {AssociationPicker} from './AssociationPicker';
import {useEntryOps, useSectionOps} from './useResumeContent';
import {createProjectEntry, DEFAULT_SECTION_LABELS} from '../../utils/resume/sectionFactory';
import {editorStyles} from './styles';

interface SectionProps {
  resumeId: string;
  section: ResumeSection;
  index: number;
  count: number;
}

export const ProjectsSection = ({resumeId, section, index, count}: SectionProps): React.JSX.Element | null => {
  const ops = useSectionOps(resumeId, section, index, count);
  const entryOps = useEntryOps(resumeId, section.id);

  if (section.type !== 'projects') {
    return null;
  }

  const title = section.title ?? DEFAULT_SECTION_LABELS.projects;

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
      <RepeatableSectionEditor<ProjectEntry>
        entries={section.entries}
        addLabel="Add project"
        emptyHint="No projects yet. Add a project to showcase your work."
        onAdd={() => entryOps.add(createProjectEntry(section.entries.length))}
        onUpdate={entryOps.updateEntry}
        onRemove={entryOps.remove}
        onDuplicate={entryOps.duplicate}
        onMove={entryOps.move}
        renderEntry={(entry, onChange) => (
          <View style={editorStyles.fieldGap}>
            <AppTextInput
              label="Project name"
              value={entry.name ?? ''}
              onChangeText={value => onChange({name: value})}
            />
            <AppTextInput
              label="Role"
              value={entry.role ?? ''}
              onChangeText={value => onChange({role: value})}
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
                />
              </View>
            </View>
            <AppTextInput
              label="Description"
              value={entry.description ?? ''}
              onChangeText={value => onChange({description: value})}
              multiline
              numberOfLines={3}
            />
            <RepeatableStrings
              label="Responsibilities"
              values={entry.responsibilities ?? []}
              onChange={responsibilities => onChange({responsibilities})}
            />
            <RepeatableStrings
              label="Achievements"
              values={entry.achievements ?? []}
              onChange={achievements => onChange({achievements})}
            />
            <RepeatableStrings
              label="Technologies"
              values={entry.technologies ?? []}
              onChange={technologies => onChange({technologies})}
            />
            <AppTextInput
              label="Project URL"
              value={entry.url ?? ''}
              onChangeText={value => onChange({url: value})}
            />
            <AppTextInput
              label="GitHub URL"
              value={entry.githubUrl ?? ''}
              onChangeText={value => onChange({githubUrl: value})}
            />
            <AppTextInput
              label="Demo URL"
              value={entry.demoUrl ?? ''}
              onChangeText={value => onChange({demoUrl: value})}
            />
            <AssociationPicker
              resumeId={resumeId}
              targetType="experience"
              selectedIds={entry.associatedExperienceIds ?? []}
              onToggle={id => {
                const current = entry.associatedExperienceIds ?? [];
                onChange({
                  associatedExperienceIds: current.includes(id)
                    ? current.filter(x => x !== id)
                    : [...current, id],
                });
              }}
            />
          </View>
        )}
      />
    </SectionShell>
  );
};
