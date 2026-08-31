import React from 'react';
import {Text, View} from 'react-native';
import {AppButton, AppTextInput} from '../index';
import {editorColors, editorStyles} from './styles';

interface SectionShellProps {
  title: string;
  titleEditable?: boolean;
  onTitleChange?: (title: string) => void;
  hidden?: boolean;
  removable?: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisible: () => void;
  onRemove: () => void;
  children: React.ReactNode;
}

export const SectionShell = ({
  title,
  titleEditable = false,
  onTitleChange,
  hidden = false,
  removable = true,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onToggleVisible,
  onRemove,
  children,
}: SectionShellProps): React.JSX.Element => {
  return (
    <View style={editorStyles.card}>
      <View style={editorStyles.header}>
        <View style={editorStyles.headerLeft}>
          <Text style={editorStyles.dragHandle}>≡</Text>
          {titleEditable ? (
            <AppTextInput
              value={title}
              onChangeText={value => onTitleChange?.(value)}
              style={editorStyles.titleInput}
            />
          ) : (
            <Text style={editorStyles.title} numberOfLines={1}>
              {title}
              {hidden ? ' (hidden)' : ''}
            </Text>
          )}
        </View>
        <View style={editorStyles.headerActions}>
          <AppButton
            mode="text"
            compact
            disabled={!canMoveUp}
            onPress={onMoveUp}>
            ↑
          </AppButton>
          <AppButton
            mode="text"
            compact
            disabled={!canMoveDown}
            onPress={onMoveDown}>
            ↓
          </AppButton>
          <AppButton mode="text" compact onPress={onToggleVisible}>
            {hidden ? 'Show' : 'Hide'}
          </AppButton>
          {removable ? (
            <AppButton
              mode="text"
              compact
              textColor={editorColors.danger}
              onPress={onRemove}>
              Delete
            </AppButton>
          ) : null}
        </View>
      </View>
      <View style={editorStyles.content}>{children}</View>
    </View>
  );
};
