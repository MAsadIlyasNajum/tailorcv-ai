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
  reorderSkillGroup,
  reorderSkill,
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
        <View style={editorStyles.row}>
          <Text style={styles.uncategorizedTitle}>Skills (no group)</Text>
          {section.groups.length > 0 && (
            <AppButton
              mode="text"
              compact
              onPress={() => setMoveId(moveId === 'uncategorized' ? null : 'uncategorized')}
              accessibilityLabel="Move uncategorized skills"
              accessibilityHint="Move uncategorized skills to a group">
              Move
            </AppButton>
          )}
        </View>
        {section.uncategorized.length === 0 ? (
          <Text style={editorStyles.emptyHint}>No uncategorized skills yet.</Text>
        ) : (
          <View style={styles.chips}>
            {section.uncategorized.map((skill, skillIndex) => (
              <View key={skill.id} style={styles.skillRow}>
                <Text style={editorStyles.chipText}>{skill.name}</Text>
                <AppButton
                  mode="text"
                  compact
                  style={editorStyles.headerAction}
                  disabled={skillIndex === 0}
                  onPress={() => update(prev => reorderSkill(prev, section.id, null, skill.id, -1))}
                  accessibilityLabel="Move skill up"
                  accessibilityHint="Move this skill earlier in the list">
                  ↑
                </AppButton>
                <AppButton
                  mode="text"
                  compact
                  style={editorStyles.headerAction}
                  disabled={skillIndex === section.uncategorized.length - 1}
                  onPress={() => update(prev => reorderSkill(prev, section.id, null, skill.id, 1))}
                  accessibilityLabel="Move skill down"
                  accessibilityHint="Move this skill later in the list">
                  ↓
                </AppButton>
                <AppButton
                  mode="text"
                  compact
                  style={editorStyles.headerAction}
                  textColor={editorColors.danger}
                  onPress={() => update(prev => removeSkill(prev, section.id, skill.id))}
                  accessibilityLabel="Remove skill"
                  accessibilityHint={`Remove ${skill.name}`}>
                  ×
                </AppButton>
              </View>
            ))}
          </View>
        )}
        {moveId === 'uncategorized' && section.groups.length > 0 ? (
          <View style={styles.chips}>
            <Text style={editorStyles.emptyHint}>Move to group:</Text>
            {section.groups.map(group => (
              <AppButton
                key={group.id}
                mode="outlined"
                compact
                onPress={() => {
                  const firstUncategorized = section.uncategorized[0];
                  if (firstUncategorized) {
                    update(prev => moveSkill(prev, section.id, firstUncategorized.id, group.id));
                  }
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

      {section.groups.map((group, _groupIndex) => (
        <View key={group.id} style={editorStyles.groupCard}>
          <View style={styles.groupHeaderRow}>
            <View style={editorStyles.flexField}>
              <AppTextInput
                value={group.title}
                onChangeText={value => update(prev => renameSkillGroup(prev, section.id, group.id, value))}
                dense
              />
            </View>
            <View style={styles.groupHeaderRow}>
              <AppButton
                mode="text"
                compact
                style={editorStyles.headerAction}
                disabled={_groupIndex === 0}
                onPress={() => update(prev => reorderSkillGroup(prev, section.id, group.id, -1))}
                accessibilityLabel="Move group up"
                accessibilityHint="Move this group earlier">
                ↑
              </AppButton>
              <AppButton
                mode="text"
                compact
                style={editorStyles.headerAction}
                disabled={_groupIndex === section.groups.length - 1}
                onPress={() => update(prev => reorderSkillGroup(prev, section.id, group.id, 1))}
                accessibilityLabel="Move group down"
                accessibilityHint="Move this group later">
                ↓
              </AppButton>
            </View>
            <AppButton
              mode="text"
              compact
              style={editorStyles.headerAction}
              textColor={editorColors.danger}
              onPress={() => update(prev => removeSkillGroup(prev, section.id, group.id))}
              accessibilityLabel="Remove group"
              accessibilityHint={`Remove ${group.title} group`}>
              Remove
            </AppButton>
          </View>
          {group.skills.length === 0 ? (
            <Text style={editorStyles.emptyHint}>No skills in this group yet.</Text>
          ) : (
            <View style={styles.chips}>
              {group.skills.map((skill, skillIndex) => (
                <View key={skill.id} style={styles.skillRow}>
                  <Text style={editorStyles.chipText}>{skill.name}</Text>
                  <AppButton
                    mode="text"
                    compact
                    style={editorStyles.headerAction}
                    disabled={skillIndex === 0}
                    onPress={() => update(prev => reorderSkill(prev, section.id, group.id, skill.id, -1))}
                    accessibilityLabel="Move skill up"
                    accessibilityHint="Move this skill earlier in the group">
                    ↑
                  </AppButton>
                  <AppButton
                    mode="text"
                    compact
                    style={editorStyles.headerAction}
                    disabled={skillIndex === group.skills.length - 1}
                    onPress={() => update(prev => reorderSkill(prev, section.id, group.id, skill.id, 1))}
                    accessibilityLabel="Move skill down"
                    accessibilityHint="Move this skill later in the group">
                    ↓
                  </AppButton>
                  <AppButton
                    mode="text"
                    compact
                    style={editorStyles.headerAction}
                    onPress={() => update(prev => moveSkill(prev, section.id, skill.id, null))}
                    accessibilityLabel="Move to uncategorized"
                    accessibilityHint="Move this skill to uncategorized">
                    Move
                  </AppButton>
                  <AppButton
                    mode="text"
                    compact
                    style={editorStyles.headerAction}
                    textColor={editorColors.danger}
                    onPress={() => update(prev => removeSkill(prev, section.id, skill.id))}
                    accessibilityLabel="Remove skill"
                    accessibilityHint={`Remove ${skill.name}`}>
                    ×
                  </AppButton>
                </View>
              ))}
            </View>
          )}
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
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 2,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  uncategorizedTitle: {
    flex: 1,
  },
});
