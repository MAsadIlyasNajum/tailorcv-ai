import React from 'react';
import {Text, View} from 'react-native';
import {AppTextInput} from '../index';
import type {ResumeSection} from '../../types/resume';
import {SectionShell} from './SectionShell';
import {ContactsEditor} from './ContactsEditor';
import {useResumeContent, useSectionOps} from './useResumeContent';
import {moveContact, updatePersonalInfo} from '../../utils/resume/contentMutators';
import {editorStyles} from './styles';

interface SectionProps {
  resumeId: string;
  section: ResumeSection;
  index: number;
  count: number;
}

const deriveFullName = (firstName?: string, lastName?: string): string =>
  `${firstName ?? ''} ${lastName ?? ''}`.trim();

export const deriveFullNameFromParts = (firstName?: string, lastName?: string): string =>
  deriveFullName(firstName, lastName);

export const PersonalInfoSection = ({resumeId, section, index, count}: SectionProps): React.JSX.Element | null => {
  const ops = useSectionOps(resumeId, section, index, count);
  const {update} = useResumeContent(resumeId);

  if (section.type !== 'personalInfo') {
    return null;
  }
  const data = section.data;
  const showFullName = !data.firstName && !data.lastName;

  const handleNameChange = (field: 'firstName' | 'lastName', value: string): void => {
    const next = {...data, [field]: value};
    const derived = deriveFullName(next.firstName, next.lastName);
    next.fullName = derived;
    update(prev => updatePersonalInfo(prev, section.id, next));
  };

  const moveContactUp = (field: 'emails' | 'phoneNumbers' | 'addresses' | 'links', idx: number): void => {
    update(prev => moveContact(prev, section.id, idx, -1));
  };

  const moveContactDown = (field: 'emails' | 'phoneNumbers' | 'addresses' | 'links', idx: number): void => {
    update(prev => moveContact(prev, section.id, idx, 1));
  };

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
      <View style={editorStyles.fieldGap}>
        <View style={editorStyles.row}>
          <View style={editorStyles.flexField}>
            <AppTextInput
              label="First name"
              value={data.firstName ?? ''}
              onChangeText={value => handleNameChange('firstName', value)}
              placeholder="Jane"
            />
          </View>
          <View style={editorStyles.flexField}>
            <AppTextInput
              label="Last name"
              value={data.lastName ?? ''}
              onChangeText={value => handleNameChange('lastName', value)}
              placeholder="Doe"
            />
          </View>
        </View>
        {showFullName ? (
          <AppTextInput
            label="Full name"
            value={data.fullName ?? ''}
            onChangeText={value => update(prev => updatePersonalInfo(prev, section.id, {fullName: value}))}
          />
        ) : (
          <Text style={editorStyles.emptyHint}>
            Auto-generated from first and last name
          </Text>
        )}
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
          onMoveUp={idx => moveContactUp('emails', idx)}
          onMoveDown={idx => moveContactDown('emails', idx)}
        />
        <ContactsEditor
          label="Phone numbers"
          values={data.phoneNumbers}
          valuePlaceholder="+1 555 000 0000"
          onChange={phoneNumbers => update(prev => updatePersonalInfo(prev, section.id, {phoneNumbers}))}
          onMoveUp={idx => moveContactUp('phoneNumbers', idx)}
          onMoveDown={idx => moveContactDown('phoneNumbers', idx)}
        />
        <ContactsEditor
          label="Addresses"
          values={data.addresses}
          valuePlaceholder="City, Country"
          onChange={addresses => update(prev => updatePersonalInfo(prev, section.id, {addresses}))}
          onMoveUp={idx => moveContactUp('addresses', idx)}
          onMoveDown={idx => moveContactDown('addresses', idx)}
        />
        <ContactsEditor
          label="Links"
          isLink
          values={data.links}
          valuePlaceholder="https://..."
          onChange={links => update(prev => updatePersonalInfo(prev, section.id, {links}))}
          onMoveUp={idx => moveContactUp('links', idx)}
          onMoveDown={idx => moveContactDown('links', idx)}
        />
      </View>
    </SectionShell>
  );
};
