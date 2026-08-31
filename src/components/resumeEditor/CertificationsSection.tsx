import React from 'react';
import {View} from 'react-native';
import {AppTextInput} from '../index';
import type {CertificationEntry, ResumeSection} from '../../types/resume';
import {SectionShell} from './SectionShell';
import {RepeatableSectionEditor} from './RepeatableSectionEditor';
import {useEntryOps, useSectionOps} from './useResumeContent';
import {createCertificationEntry, DEFAULT_SECTION_LABELS} from '../../utils/resume/sectionFactory';
import {editorStyles} from './styles';

interface SectionProps {
  resumeId: string;
  section: ResumeSection;
  index: number;
  count: number;
}

export const CertificationsSection = ({resumeId, section, index, count}: SectionProps): React.JSX.Element | null => {
  const ops = useSectionOps(resumeId, section, index, count);
  const entryOps = useEntryOps(resumeId, section.id);

  if (section.type !== 'certifications') {
    return null;
  }

  const title = section.title ?? DEFAULT_SECTION_LABELS.certifications;

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
      <RepeatableSectionEditor<CertificationEntry>
        entries={section.entries}
        addLabel="Add certification"
        emptyHint="No certifications yet."
        onAdd={() => entryOps.add(createCertificationEntry(section.entries.length))}
        onUpdate={entryOps.updateEntry}
        onRemove={entryOps.remove}
        onDuplicate={entryOps.duplicate}
        onMove={entryOps.move}
        renderEntry={(entry, onChange) => (
          <View style={editorStyles.fieldGap}>
            <AppTextInput
              label="Certification name"
              value={entry.name ?? ''}
              onChangeText={value => onChange({name: value})}
            />
            <AppTextInput
              label="Issuing organization"
              value={entry.issuer ?? ''}
              onChangeText={value => onChange({issuer: value})}
            />
            <View style={editorStyles.row}>
              <View style={editorStyles.flexField}>
                <AppTextInput
                  label="Issue date"
                  value={entry.issueDate ?? ''}
                  onChangeText={value => onChange({issueDate: value})}
                  placeholder="2024"
                />
              </View>
              <View style={editorStyles.flexField}>
                <AppTextInput
                  label="Expiration date"
                  value={entry.expirationDate ?? ''}
                  onChangeText={value => onChange({expirationDate: value})}
                  placeholder="optional"
                />
              </View>
            </View>
            <AppTextInput
              label="Credential ID"
              value={entry.credentialId ?? ''}
              onChangeText={value => onChange({credentialId: value})}
            />
            <AppTextInput
              label="Credential URL"
              value={entry.credentialUrl ?? ''}
              onChangeText={value => onChange({credentialUrl: value})}
            />
            <AppTextInput
              label="Description"
              value={entry.description ?? ''}
              onChangeText={value => onChange({description: value})}
              multiline
              numberOfLines={3}
            />
          </View>
        )}
      />
    </SectionShell>
  );
};
