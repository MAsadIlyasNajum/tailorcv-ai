import React from 'react';
import {Text} from 'react-native';
import {AppTextInput} from '../index';
import type {ResumeSection} from '../../types/resume';
import {SectionShell} from './SectionShell';
import {ContactsEditor} from './ContactsEditor';
import {useResumeContent, useSectionOps} from './useResumeContent';
import {updatePersonalInfo} from '../../utils/resume/contentMutators';
import {editorStyles} from './styles';

interface SectionProps {
  resumeId: string;
  section: ResumeSection;
  index: number;
  count: number;
}

export const PersonalInfoSection = ({resumeId, section, index, count}: SectionProps): React.JSX.Element | null => {
  const ops = useSectionOps(resumeId, section, index, count);
  const {update} = useResumeContent(resumeId);

  if (section.type !== 'personalInfo') {
    return null;
  }
  const data = section.data;

  return (
    <SectionShell
      title="Personal Information"
      hidden={!section.visible}
      removable={false}
      canMoveUp={ops.canMoveUp}
      canMoveDown={ops.canMoveDown}
      onMoveUp={ops.moveUp}
      onMoveDown={ops.moveDown}
      onToggleVisible={ops.toggleVisible}
      onRemove={ops.remove}>
      <AppTextInput
        label="Full name"
        value={data.fullName ?? ''}
        onChangeText={value => update(prev => updatePersonalInfo(prev, section.id, {fullName: value}))}
      />
      <AppTextInput
        label="Profile photo (local file path, optional)"
        value={data.photoUri ?? ''}
        onChangeText={value => update(prev => updatePersonalInfo(prev, section.id, {photoUri: value}))}
        placeholder="file://..."
      />
      <Text style={editorStyles.emptyHint}>
        Stored locally only. Never uploaded to a server.
      </Text>
      <ContactsEditor
        label="Emails"
        values={data.emails}
        valuePlaceholder="name@example.com"
        onChange={emails => update(prev => updatePersonalInfo(prev, section.id, {emails}))}
      />
      <ContactsEditor
        label="Phone numbers"
        values={data.phoneNumbers}
        valuePlaceholder="+1 555 000 0000"
        onChange={phoneNumbers => update(prev => updatePersonalInfo(prev, section.id, {phoneNumbers}))}
      />
      <ContactsEditor
        label="Addresses"
        values={data.addresses}
        valuePlaceholder="City, Country"
        onChange={addresses => update(prev => updatePersonalInfo(prev, section.id, {addresses}))}
      />
      <ContactsEditor
        label="Links"
        isLink
        values={data.links}
        valuePlaceholder="https://..."
        onChange={links => update(prev => updatePersonalInfo(prev, section.id, {links}))}
      />
    </SectionShell>
  );
};
