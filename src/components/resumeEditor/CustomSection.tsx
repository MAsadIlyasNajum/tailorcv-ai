import React, {useState} from 'react';
import {Text, View} from 'react-native';
import {AppButton, AppTextInput} from '../index';
import type {CustomEntry, ResumeSection} from '../../types/resume';
import {SectionShell} from './SectionShell';
import {useResumeContent, useSectionOps} from './useResumeContent';
import {updateCustomSection, renameSection} from '../../utils/resume/contentMutators';
import {createCustomEntry} from '../../utils/resume/sectionFactory';
import {editorColors, editorStyles} from './styles';

interface SectionProps {
  resumeId: string;
  section: ResumeSection;
  index: number;
  count: number;
}

export const CustomSection = ({resumeId, section, index, count}: SectionProps): React.JSX.Element | null => {
  const ops = useSectionOps(resumeId, section, index, count);
  const {update} = useResumeContent(resumeId);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  if (section.type !== 'custom') {
    return null;
  }

  const entries = section.data.entries ?? [];

  const addEntry = (): void => {
    if (!newTitle.trim() && !newContent.trim()) {
      return;
    }
    update(prev =>
      updateCustomSection(prev, section.id, {
        entries: [...entries, {...createCustomEntry(), title: newTitle, content: newContent}],
      }),
    );
    setNewTitle('');
    setNewContent('');
  };

  const updateEntry = (id: string, patch: Partial<CustomEntry>): void => {
    update(prev =>
      updateCustomSection(prev, section.id, {
        entries: entries.map(e => (e.id === id ? {...e, ...patch} : e)),
      }),
    );
  };

  const removeEntry = (id: string): void => {
    update(prev =>
      updateCustomSection(prev, section.id, {
        entries: entries.filter(e => e.id !== id),
      }),
    );
  };

  return (
    <SectionShell
      title={section.title ?? 'Custom Section'}
      titleEditable
      hidden={!section.visible}
      canMoveUp={ops.canMoveUp}
      canMoveDown={ops.canMoveDown}
      onMoveUp={ops.moveUp}
      onMoveDown={ops.moveDown}
      onToggleVisible={ops.toggleVisible}
      onRemove={ops.remove}
      onTitleChange={title => update(prev => renameSection(prev, section.id, title))}>
      <AppTextInput
        label="Section content"
        value={section.data.content ?? ''}
        onChangeText={value => update(prev => updateCustomSection(prev, section.id, {content: value}))}
        placeholder="Free-form text for content that doesn't fit standard sections"
        multiline
        numberOfLines={4}
      />

      <Text style={editorStyles.groupTitle}>Entries (optional)</Text>
      {entries.map(entry => (
        <View key={entry.id} style={editorStyles.entryCard}>
          <AppTextInput
            label="Entry title"
            value={entry.title ?? ''}
            onChangeText={value => updateEntry(entry.id, {title: value})}
          />
          <AppTextInput
            label="Entry content"
            value={entry.content ?? ''}
            onChangeText={value => updateEntry(entry.id, {content: value})}
            multiline
            numberOfLines={3}
          />
          <AppButton
            mode="text"
            compact
            textColor={editorColors.danger}
            onPress={() => removeEntry(entry.id)}>
            Remove entry
          </AppButton>
        </View>
      ))}

      <View style={editorStyles.fieldGap}>
        <AppTextInput
          label="New entry title"
          value={newTitle}
          onChangeText={setNewTitle}
        />
        <AppTextInput
          label="New entry content"
          value={newContent}
          onChangeText={setNewContent}
          multiline
          numberOfLines={3}
        />
        <AppButton mode="text" onPress={addEntry}>
          Add entry
        </AppButton>
      </View>
    </SectionShell>
  );
};
