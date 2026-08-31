import React from 'react';
import {Text, View} from 'react-native';
import {AppButton, AppTextInput} from '../index';
import type {AddressValue, ContactValue, LinkValue} from '../../types/resume';
import {editorColors, editorStyles} from './styles';

interface ContactsEditorProps<T extends ContactValue | AddressValue | LinkValue> {
  label: string;
  values: T[];
  onChange: (values: T[]) => void;
  valuePlaceholder?: string;
  valueLabel?: string;
  isLink?: boolean;
  showLabelField?: boolean;
}

export const ContactsEditor = <T extends ContactValue | AddressValue | LinkValue>({
  label,
  values,
  onChange,
  valuePlaceholder = 'Value',
  isLink = false,
  showLabelField = true,
}: ContactsEditorProps<T>): React.JSX.Element => {
  const list = values.length ? values : ([] as unknown as T[]);
  const update = (index: number, patch: Partial<T>): void => {
    const next = [...list];
    next[index] = {...next[index], ...patch} as T;
    onChange(next);
  };
  const remove = (index: number): void => {
    onChange(list.filter((_, i) => i !== index));
  };
  const add = (): void => {
    onChange([...list, {id: '', value: '', label: undefined} as unknown as T]);
  };

  return (
    <View style={editorStyles.fieldGap}>
      <Text style={editorStyles.groupTitle}>{label}</Text>
      {list.map((item, index) => (
        <View key={item.id || index} style={editorStyles.linkRow}>
          {showLabelField ? (
            <View style={editorStyles.flexField}>
              <AppTextInput
                value={item.label ?? ''}
                onChangeText={value => update(index, {label: value} as Partial<T>)}
                placeholder={isLink ? 'Label (optional)' : 'Type (optional)'}
                dense
              />
            </View>
          ) : null}
          <View style={editorStyles.flexField}>
            <AppTextInput
              value={item.value}
              onChangeText={value => update(index, {value} as Partial<T>)}
              placeholder={valuePlaceholder}
              dense
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
        Add {label.toLowerCase().replace(/s$/, '')}
      </AppButton>
    </View>
  );
};
