import React, {useState} from 'react';
import {Text, View} from 'react-native';
import {AppButton} from '../index';
import {editorColors, editorStyles} from './styles';

interface RepeatableSectionEditorProps<T extends {id: string; order: number}> {
  entries: T[];
  addLabel: string;
  emptyHint?: string;
  renderEntry: (entry: T, onChange: (patch: Partial<T>) => void) => React.ReactNode;
  onAdd: () => void;
  onUpdate: (entry: T) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
}

export const RepeatableSectionEditor = <T extends {id: string; order: number}>({
  entries,
  addLabel,
  emptyHint,
  renderEntry,
  onAdd,
  onUpdate,
  onRemove,
  onDuplicate,
  onMove,
}: RepeatableSectionEditorProps<T>): React.JSX.Element => {
  const [collapsedId, setCollapsedId] = useState<string | null>(null);

  const entryLabel = (entry: T): string => {
    const anyEntry = entry as Record<string, unknown>;
    return (
      (anyEntry.company as string) ||
      (anyEntry.role as string) ||
      (anyEntry.name as string) ||
      (anyEntry.institution as string) ||
      (anyEntry.title as string) ||
      'Untitled entry'
    );
  };

  return (
    <View style={editorStyles.fieldGap}>
      {entries.length === 0 && emptyHint ? (
        <Text style={editorStyles.emptyHint}>{emptyHint}</Text>
      ) : null}

      {entries.map((entry, index) => {
        const collapsed = collapsedId === entry.id;
        return (
          <View key={entry.id} style={editorStyles.entryCard}>
            <View style={editorStyles.entryHeader}>
              <Text style={editorStyles.entryTitle} numberOfLines={1}>
                {entryLabel(entry)}
              </Text>
              <View style={editorStyles.headerActions}>
                <AppButton
                  mode="text"
                  compact
                  disabled={index === 0}
                  onPress={() => onMove(entry.id, -1)}>
                  ↑
                </AppButton>
                <AppButton
                  mode="text"
                  compact
                  disabled={index === entries.length - 1}
                  onPress={() => onMove(entry.id, 1)}>
                  ↓
                </AppButton>
                <AppButton
                  mode="text"
                  compact
                  onPress={() => setCollapsedId(collapsed ? null : entry.id)}>
                  {collapsed ? 'Show' : 'Hide'}
                </AppButton>
                <AppButton
                  mode="text"
                  compact
                  onPress={() => onDuplicate(entry.id)}>
                  Duplicate
                </AppButton>
                <AppButton
                  mode="text"
                  compact
                  textColor={editorColors.danger}
                  onPress={() => onRemove(entry.id)}>
                  Delete
                </AppButton>
              </View>
            </View>
            {!collapsed ? (
              <View style={editorStyles.fieldGap}>
                {renderEntry(entry, patch =>
                  onUpdate({...entry, ...patch} as T),
                )}
              </View>
            ) : null}
          </View>
        );
      })}

      <AppButton mode="contained" onPress={onAdd}>
        {addLabel}
      </AppButton>
    </View>
  );
};
