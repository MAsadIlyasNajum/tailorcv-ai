import React, {useMemo, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {Button, Card, Switch, TextInput} from 'react-native-paper';

import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {useResumeStore} from '../store/useResumeStore';
import type {ProfessionalExperience} from '../types/resume';
import {validateProfessionalExperience} from '../utils/validation/experienceValidation';

type ExperienceDraft = {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrentRole: boolean;
  summary: string;
  bulletPoints: string[];
  keywords: string[];
  generatedSuggestions: string[];
};

const EMPTY_EXPERIENCE: ExperienceDraft = {
  id: '',
  jobTitle: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  isCurrentRole: false,
  summary: '',
  bulletPoints: [''],
  keywords: [],
  generatedSuggestions: [],
};

export const ExperienceEditorScreen = (): React.JSX.Element => {
  const experiences = useResumeStore(state => state.professionalExperiences);
  const setProfessionalExperiences = useResumeStore(state => state.setProfessionalExperiences);
  const addProfessionalExperience = useResumeStore(state => state.addProfessionalExperience);
  const updateProfessionalExperience = useResumeStore(state => state.updateProfessionalExperience);
  const removeProfessionalExperience = useResumeStore(state => state.removeProfessionalExperience);

  const [draft, setDraft] = useState(EMPTY_EXPERIENCE);

  const validation = useMemo(
    () => validateProfessionalExperience(draft),
    [draft],
  );

  const handleCreateExperience = (): void => {
    if (!validation.valid) {
      Alert.alert('Incomplete role', validation.message ?? 'Please complete the role details.');
      return;
    }

    const normalizedExperience = {
      ...draft,
      id: draft.id || `experience-${Date.now()}`,
      bulletPoints: draft.bulletPoints.filter(bullet => bullet.trim().length > 0),
      endDate: draft.isCurrentRole ? null : draft.endDate || null,
      keywords: [],
      generatedSuggestions: [],
    };

    if (draft.id) {
      updateProfessionalExperience(draft.id, normalizedExperience);
    } else {
      addProfessionalExperience(normalizedExperience);
    }

    setDraft(EMPTY_EXPERIENCE);
  };

  const handleEdit = (experience: ProfessionalExperience): void => {
    setDraft({
      ...EMPTY_EXPERIENCE,
      ...experience,
      location: experience.location ?? '',
      endDate: experience.endDate ?? '',
      isCurrentRole: experience.isCurrentRole ?? false,
      bulletPoints: experience.bulletPoints.length ? experience.bulletPoints : [''],
    });
  };

  const handleDelete = (id: string): void => {
    removeProfessionalExperience(id);
    if (draft.id === id) {
      setDraft(EMPTY_EXPERIENCE);
    }
  };

  const updateBullet = (index: number, value: string): void => {
    const nextBullets = [...draft.bulletPoints];
    nextBullets[index] = value;
    setDraft({...draft, bulletPoints: nextBullets});
  };

  const addBullet = (): void => {
    setDraft({...draft, bulletPoints: [...draft.bulletPoints, '']});
  };

  const removeBullet = (index: number): void => {
    if (draft.bulletPoints.length <= 1) {
      setDraft({...draft, bulletPoints: ['']});
      return;
    }

    const nextBullets = draft.bulletPoints.filter((_, bulletIndex) => bulletIndex !== index);
    setDraft({...draft, bulletPoints: nextBullets});
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Title title={draft.id ? 'Edit Experience' : 'Add Experience'} />
          <Card.Content style={styles.form}>
            <TextInput
              mode="outlined"
              label="Job title"
              value={draft.jobTitle}
              onChangeText={value => setDraft({...draft, jobTitle: value})}
            />
            <TextInput
              mode="outlined"
              label="Company"
              value={draft.company}
              onChangeText={value => setDraft({...draft, company: value})}
            />
            <TextInput
              mode="outlined"
              label="Location"
              value={draft.location}
              onChangeText={value => setDraft({...draft, location: value})}
            />
            <View style={styles.inlineRow}>
              <TextInput
                mode="outlined"
                label="Start date"
                value={draft.startDate}
                onChangeText={value => setDraft({...draft, startDate: value})}
                style={styles.flexField}
              />
              <TextInput
                mode="outlined"
                label="End date"
                value={draft.endDate ?? ''}
                onChangeText={value => setDraft({...draft, endDate: value})}
                style={styles.flexField}
                disabled={draft.isCurrentRole}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Current role</Text>
              <Switch
                value={draft.isCurrentRole}
                onValueChange={value => setDraft({...draft, isCurrentRole: value, endDate: value ? '' : draft.endDate})}
              />
            </View>

            <TextInput
              mode="outlined"
              label="Role summary"
              value={draft.summary}
              multiline
              onChangeText={value => setDraft({...draft, summary: value})}
              style={styles.textArea}
            />

            <View style={styles.bulletHeader}>
              <Text style={styles.sectionTitle}>Key achievements</Text>
              <Button mode="text" onPress={addBullet}>Add bullet</Button>
            </View>

            {draft.bulletPoints.map((bullet, index) => (
              <View key={`${index}-${bullet}`} style={styles.bulletRow}>
                <TextInput
                  mode="outlined"
                  value={bullet}
                  onChangeText={value => updateBullet(index, value)}
                  style={styles.bulletInput}
                  multiline
                />
                {draft.bulletPoints.length > 1 ? (
                  <Button mode="text" onPress={() => removeBullet(index)} compact>
                    Remove
                  </Button>
                ) : null}
              </View>
            ))}

            {draft.id ? (
              <View style={styles.buttonsRow}>
                <PrimaryButton
                  label="Save experience"
                  onPress={handleCreateExperience}
                  fullWidth={false}
                />
                <Button mode="text" onPress={() => setDraft(EMPTY_EXPERIENCE)}>
                  Cancel
                </Button>
              </View>
            ) : (
              <PrimaryButton
                label="Add experience"
                onPress={handleCreateExperience}
              />
            )}

            {validation.valid ? null : (
              <Text style={styles.validation}>{validation.message}</Text>
            )}
          </Card.Content>
        </Card>

        {experiences.length ? (
          <Card style={styles.card}>
            <Card.Title title="Saved roles" />
            <Card.Content>
              {experiences.map(experience => (
                <View key={experience.id} style={styles.savedRole}>
                  <View style={styles.savedRoleHeader}>
                    <Text style={styles.roleTitle}>{experience.jobTitle}</Text>
                    <Text style={styles.roleCompany}>{experience.company}</Text>
                  </View>
                  <Text style={styles.roleMeta}>
                    {experience.startDate} {experience.isCurrentRole ? '– Present' : `– ${experience.endDate ?? ''}`}
                  </Text>
                  <Text style={styles.roleSummary}>{experience.summary}</Text>
                  <View style={styles.savedActions}>
                    <Button mode="text" onPress={() => handleEdit(experience)}>Edit</Button>
                    <Button mode="text" onPress={() => handleDelete(experience.id)}>Delete</Button>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        ) : null}

        {experiences.length ? (
          <PrimaryButton
            label="Clear all roles"
            onPress={() => {
              setProfessionalExperiences([]);
              setDraft(EMPTY_EXPERIENCE);
            }}
          />
        ) : null}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  card: {
    borderRadius: 16,
  },
  form: {
    gap: 12,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flexField: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  textArea: {
    minHeight: 120,
  },
  bulletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  bulletRow: {
    gap: 4,
  },
  bulletInput: {
    minHeight: 72,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  validation: {
    fontSize: 13,
    color: '#B91C1C',
    lineHeight: 20,
  },
  savedRole: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 6,
  },
  savedRoleHeader: {
    gap: 2,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  roleCompany: {
    fontSize: 13,
    color: '#475569',
  },
  roleMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  roleSummary: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  savedActions: {
    flexDirection: 'row',
    gap: 4,
  },
});
