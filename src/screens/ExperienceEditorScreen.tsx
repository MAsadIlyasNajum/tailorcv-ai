import React, {useMemo, useState} from 'react';
import {Alert, StyleSheet, Switch, Text, View} from 'react-native';
import {AppButton, AppCard, AppTextInput} from '../components';

import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {useResumeStore} from '../store/useResumeStore';
import type {ProfessionalExperience} from '../types/resume';
import {validateProfessionalExperience} from '../utils/validation/experienceValidation';
import {colors, typography, spacing, borderRadius, shadows} from '../app/theme/designTokens';

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
  const resumes = useResumeStore(state => state.resumes);
  const currentResumeId = useResumeStore(state => state.currentResumeId);
  const addProfessionalExperience = useResumeStore(state => state.addProfessionalExperience);
  const updateProfessionalExperience = useResumeStore(state => state.updateProfessionalExperience);
  const removeProfessionalExperience = useResumeStore(state => state.removeProfessionalExperience);

  const currentResume = useMemo(
    () => resumes.find(r => r.id === currentResumeId) ?? null,
    [resumes, currentResumeId],
  );

  const experiences = currentResume?.professionalExperiences ?? [];

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
        <AppCard style={styles.card}>
          <AppCard.Title title={draft.id ? 'Edit Experience' : 'Add Experience'} />
          <AppCard.Content style={styles.form}>
            <AppTextInput
              label="Job title"
              value={draft.jobTitle}
              onChangeText={value => setDraft({...draft, jobTitle: value})}
            />
            <AppTextInput
              label="Company"
              value={draft.company}
              onChangeText={value => setDraft({...draft, company: value})}
            />
            <AppTextInput
              label="Location"
              value={draft.location}
              onChangeText={value => setDraft({...draft, location: value})}
            />
            <View style={styles.inlineRow}>
              <AppTextInput
                label="Start date"
                value={draft.startDate}
                onChangeText={value => setDraft({...draft, startDate: value})}
                style={styles.flexField}
              />
              <AppTextInput
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

            <AppTextInput
              label="Role summary"
              value={draft.summary}
              multiline
              onChangeText={value => setDraft({...draft, summary: value})}
              style={styles.textArea}
            />

            <View style={styles.bulletHeader}>
              <Text style={styles.sectionTitle}>Key achievements</Text>
              <AppButton mode="text" onPress={addBullet}>Add bullet</AppButton>
            </View>

            {draft.bulletPoints.map((bullet, index) => (
              <View key={`${index}-${bullet}`} style={styles.bulletRow}>
                <AppTextInput
                  value={bullet}
                  onChangeText={value => updateBullet(index, value)}
                  style={styles.bulletInput}
                  multiline
                />
                {draft.bulletPoints.length > 1 ? (
                  <AppButton mode="text" onPress={() => removeBullet(index)} compact>
                    Remove
                  </AppButton>
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
                <AppButton mode="text" fullWidth={false} onPress={() => setDraft(EMPTY_EXPERIENCE)}>
                  Cancel
                </AppButton>
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
          </AppCard.Content>
        </AppCard>

        {experiences.length ? (
          <AppCard style={styles.card}>
            <AppCard.Title title="Saved roles" />
            <AppCard.Content>
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
                    <AppButton mode="text" fullWidth={false} onPress={() => handleEdit(experience)}>Edit</AppButton>
                    <AppButton mode="text" fullWidth={false} onPress={() => handleDelete(experience.id)}>Delete</AppButton>
                  </View>
                </View>
              ))}
            </AppCard.Content>
          </AppCard>
        ) : null}

        {experiences.length ? (
          <PrimaryButton
            label="Clear all roles"
            onPress={() => {
              const resumeId = useResumeStore.getState().currentResumeId;
              if (resumeId) {
                useResumeStore.getState().updateResume(resumeId, {
                  professionalExperiences: [],
                  updatedAt: Date.now(),
                });
              }
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
    gap: spacing.md,
  },
  card: {
    borderRadius: borderRadius.lg,
    ...shadows.card,
  },
  form: {
    gap: spacing.md,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: spacing.md,
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
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
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
    ...typography.h4,
    color: colors.textPrimary,
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
    gap: spacing.sm,
  },
  validation: {
    ...typography.body,
    lineHeight: 20,
    color: colors.red,
  },
  savedRole: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 6,
  },
  savedRoleHeader: {
    gap: 2,
  },
  roleTitle: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  roleCompany: {
    ...typography.body,
    color: colors.textSecondary,
  },
  roleMeta: {
    ...typography.mono,
    fontSize: 12,
    color: colors.textTertiary,
  },
  roleSummary: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  savedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
