import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AppButton, AppTextInput} from '../index';
import type {ResumeSection} from '../../types/resume';
import {SectionShell} from './SectionShell';
import {useResumeContent, useSectionOps} from './useResumeContent';
import {
  addSkill,
  addSkillGroup,
  moveSkill,
  removeSkill,
  removeSkillGroup,
  renameSkillGroup,
} from '../../utils/resume/contentMutators';
import {DEFAULT_SECTION_LABELS} from '../../utils/resume/sectionFactory';
import {editorColors, editorStyles} from './styles';

interface SectionProps {
  resumeId: string;
  section: ResumeSection;
  index: number;
  count: number;
}

export const SkillsSection = ({resumeId, section, index, count}: SectionProps): React.JSX.Element | null => {
  const ops = useSectionOps(resumeId, section, index, count);
  const {update} = useResumeContent(resumeId);
  const [newSkill, setNewSkill] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [moveId, setMoveId] = useState<string | null>(null);

  if (section.type !== 'skills') {
    return null;
  }

  const title = section.title ?? DEFAULT_SECTION_LABELS.skills;

  const addUncategorized = (): void => {
    if (!newSkill.trim()) {
      return;
    }
    update(prev => addSkill(prev, section.id, newSkill));
    setNewSkill('');
  };

  const addGroup = (): void => {
    if (!newGroupName.trim()) {
      return;
    }
    update(prev => addSkillGroup(prev, section.id, newGroupName));
    setNewGroupName('');
  };

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
      <View style={editorStyles.fieldGap}>
        <Text style={editorStyles.groupTitle}>Skills (no group)</Text>
        <View style={styles.chips}>
          {section.uncategorized.map(skill => (
            <View key={skill.id} style={styles.chip}>
              <Text style={editorStyles.chipText}>{skill.name}</Text>
              <AppButton
                mode="text"
                compact
                onPress={() => setMoveId(moveId === skill.id ? null : skill.id)}>
                Move
              </AppButton>
              <AppButton
                mode="text"
                compact
                textColor={editorColors.danger}
                onPress={() => update(prev => removeSkill(prev, section.id, skill.id))}>
                ×
              </AppButton>
            </View>
          ))}
        </View>
        {moveId ? (
          <View style={styles.chips}>
            <Text style={editorStyles.emptyHint}>Move to:</Text>
            <AppButton
              mode="outlined"
              compact
              onPress={() => {
                update(prev => moveSkill(prev, section.id, moveId, null));
                setMoveId(null);
              }}>
              Uncategorized
            </AppButton>
            {section.groups.map(group => (
              <AppButton
                key={group.id}
                mode="outlined"
                compact
                onPress={() => {
                  update(prev => moveSkill(prev, section.id, moveId, group.id));
                  setMoveId(null);
                }}>
                {group.title}
              </AppButton>
            ))}
          </View>
        ) : null}
        <View style={editorStyles.linkRow}>
          <View style={editorStyles.flexField}>
            <AppTextInput
              value={newSkill}
              onChangeText={setNewSkill}
              placeholder="Add a skill"
              dense
            />
          </View>
          <AppButton mode="text" onPress={addUncategorized}>
            Add skill
          </AppButton>
        </View>
      </View>

      {section.groups.map(group => (
        <View key={group.id} style={editorStyles.groupCard}>
          <View style={editorStyles.groupHeader}>
            <View style={editorStyles.flexField}>
              <AppTextInput
                value={group.title}
                onChangeText={value => update(prev => renameSkillGroup(prev, section.id, group.id, value))}
                dense
              />
            </View>
            <AppButton
              mode="text"
              compact
              textColor={editorColors.danger}
              onPress={() => update(prev => removeSkillGroup(prev, section.id, group.id))}>
              Remove group
            </AppButton>
          </View>
          <View style={styles.chips}>
            {group.skills.map(skill => (
              <View key={skill.id} style={styles.chip}>
                <Text style={editorStyles.chipText}>{skill.name}</Text>
                <AppButton
                  mode="text"
                  compact
                  onPress={() => update(prev => moveSkill(prev, section.id, skill.id, null))}>
                  Move
                </AppButton>
                <AppButton
                  mode="text"
                  compact
                  textColor={editorColors.danger}
                  onPress={() => update(prev => removeSkill(prev, section.id, skill.id))}>
                  ×
                </AppButton>
              </View>
            ))}
          </View>
        </View>
      ))}

      <View style={editorStyles.linkRow}>
        <View style={editorStyles.flexField}>
          <AppTextInput
            value={newGroupName}
            onChangeText={setNewGroupName}
            placeholder="New group (e.g. Programming Languages)"
            dense
          />
        </View>
        <AppButton mode="text" onPress={addGroup}>
          Add group
        </AppButton>
      </View>
    </SectionShell>
  );
};

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
