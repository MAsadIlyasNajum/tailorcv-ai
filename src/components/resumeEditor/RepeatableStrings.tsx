import React from 'react';
import {Text, View} from 'react-native';
import {AppButton, AppTextInput} from '../index';
import {editorColors, editorStyles} from './styles';

interface RepeatableStringsProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  multiline?: boolean;
}

export const RepeatableStrings = ({
  label,
  values,
  onChange,
  placeholder,
  addLabel = 'Add item',
  multiline = false,
}: RepeatableStringsProps): React.JSX.Element => {
  const list = values.length ? values : [''];
  const update = (index: number, value: string): void => {
    const next = [...list];
    next[index] = value;
    onChange(next);
  };
  const remove = (index: number): void => {
    onChange(list.filter((_, i) => i !== index));
  };
  const add = (): void => {
    onChange([...list, '']);
  };

  return (
    <View style={editorStyles.fieldGap}>
      <Text style={editorStyles.groupTitle}>{label}</Text>
      {list.map((item, index) => (
        <View key={index} style={editorStyles.linkRow}>
          <View style={editorStyles.flexField}>
            <AppTextInput
              value={item}
              onChangeText={value => update(index, value)}
              placeholder={placeholder}
              multiline={multiline}
              numberOfLines={multiline ? 3 : 1}
            />
          </View>
          <AppButton
            mode="text"
            compact
            textColor={editorColors.danger}
            onPress={() => remove(index)}>
            Remove
          </AppButton>
        </View>
      ))}
      <AppButton mode="text" onPress={add}>
        {addLabel}
      </AppButton>
    </View>
  );
};
