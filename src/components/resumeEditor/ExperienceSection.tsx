import React from 'react';
import {Switch, Text, View} from 'react-native';
import {AppTextInput} from '../index';
import type {ExperienceEntry, ResumeSection} from '../../types/resume';
import {SectionShell} from './SectionShell';
import {RepeatableSectionEditor} from './RepeatableSectionEditor';
import {RepeatableStrings} from './RepeatableStrings';
import {ContactsEditor} from './ContactsEditor';
import {useEntryOps, useResumeContent, useSectionOps} from './useResumeContent';
import {
  createExperienceEntry,
  DEFAULT_SECTION_LABELS,
} from '../../utils/resume/sectionFactory';
import {editorStyles} from './styles';

interface SectionProps {
  resumeId: string;
  section: ResumeSection;
  index: number;
  count: number;
}

export const ExperienceSection = ({resumeId, section, index, count}: SectionProps): React.JSX.Element | null => {
  const ops = useSectionOps(resumeId, section, index, count);
  const entryOps = useEntryOps(resumeId, section.id);

  if (section.type !== 'experience') {
    return null;
  }

  const title = section.title ?? DEFAULT_SECTION_LABELS.experience;

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
      <RepeatableSectionEditor<ExperienceEntry>
        entries={section.entries}
        addLabel="Add experience"
        emptyHint="No experience yet. Add your first role."
        onAdd={() => entryOps.add(createExperienceEntry(section.entries.length))}
        onUpdate={entryOps.updateEntry}
        onRemove={entryOps.remove}
        onDuplicate={entryOps.duplicate}
        onMove={entryOps.move}
        renderEntry={(entry, onChange) => (
          <View style={editorStyles.fieldGap}>
            <AppTextInput
              label="Company"
              value={entry.company ?? ''}
              onChangeText={value => onChange({company: value})}
            />
            <AppTextInput
              label="Role / job title"
              value={entry.role ?? ''}
              onChangeText={value => onChange({role: value})}
            />
            <View style={editorStyles.row}>
              <View style={editorStyles.flexField}>
                <AppTextInput
                  label="Start date"
                  value={entry.startDate ?? ''}
                  onChangeText={value => onChange({startDate: value})}
                  placeholder="Jan 2023"
                />
              </View>
              <View style={editorStyles.flexField}>
                <AppTextInput
                  label="End date"
                  value={entry.endDate ?? ''}
                  onChangeText={value => onChange({endDate: value})}
                  placeholder="Present"
                  disabled={entry.isCurrent}
                />
              </View>
            </View>
            <View style={editorStyles.subRow}>
              <Text style={editorStyles.groupTitle}>Current role</Text>
              <Switch
                value={entry.isCurrent ?? false}
                onValueChange={value => onChange({isCurrent: value, endDate: value ? null : entry.endDate ?? ''})}
              />
            </View>
            <AppTextInput
              label="Employment type"
              value={entry.employmentType ?? ''}
              onChangeText={value => onChange({employmentType: value})}
              placeholder="Full-time"
            />
            <AppTextInput
              label="Location"
              value={entry.location ?? ''}
              onChangeText={value => onChange({location: value})}
            />
            <AppTextInput
              label="Summary"
              value={entry.summary ?? ''}
              onChangeText={value => onChange({summary: value})}
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
              label="Technologies / skills"
              values={entry.technologies ?? []}
              onChange={technologies => onChange({technologies})}
            />
            <DerivedProjects resumeId={resumeId} experienceId={entry.id} />
            <ContactsEditor
              label="Links"
              isLink
              values={entry.links ?? []}
              valuePlaceholder="https://..."
              onChange={links => onChange({links})}
            />
          </View>
        )}
      />
    </SectionShell>
  );
};

/**
 * Read-only, derived view of which projects reference this experience.
 * The canonical association lives on the project side
 * (`project.associatedExperienceIds[]`); we never store it on the experience.
 */
const DerivedProjects = ({resumeId, experienceId}: {resumeId: string; experienceId: string}): React.JSX.Element | null => {
  const {content} = useResumeContent(resumeId);
  const projectsSection = content.sections.find(s => s.type === 'projects');
  if (!projectsSection || projectsSection.type !== 'projects') {
    return null;
  }
  const names = projectsSection.entries
    .filter(project => (project.associatedExperienceIds ?? []).includes(experienceId))
    .map(project => project.name || 'Project');
  if (names.length === 0) {
    return null;
  }
  return (
    <View style={editorStyles.fieldGap}>
      <Text style={editorStyles.groupTitle}>Associated projects (read-only)</Text>
      <Text style={editorStyles.body}>{names.join(', ')}</Text>
    </View>
  );
};
