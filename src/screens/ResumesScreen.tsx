import React, {useMemo, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {AppButton, AppCard, AppDivider, AppTextInput} from '../components';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {useResumeStore} from '../store/useResumeStore';
import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ROUTES} from '../constants/routes';
import {trackEvent} from '../services/analytics/analytics';

type Props = NativeStackScreenProps<AppStackParamList, typeof ROUTES.RESUMES>;

export const ResumesScreen = ({navigation}: Props): React.JSX.Element => {
  const resumes = useResumeStore(state => state.resumes);
  const currentResumeId = useResumeStore(state => state.currentResumeId);
  const setCurrentResume = useResumeStore(state => state.setCurrentResume);
  const removeResume = useResumeStore(state => state.removeResume);
  const updateResume = useResumeStore(state => state.updateResume);
  const createEmptyResume = useResumeStore(state => state.createEmptyResume);

  const sortedResumes = useMemo(
    () =>
      [...resumes].sort((a, b) => b.lastUsedAt - a.lastUsedAt),
    [resumes],
  );

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleSelect = (id: string): void => {
    setCurrentResume(id);
    trackEvent('resume_selected');
    navigation.goBack();
  };

  const handleStartRename = (id: string, name: string): void => {
    setRenamingId(id);
    setRenameValue(name);
  };

  const handleDelete = (id: string, name: string): void => {
    Alert.alert(
      'Delete resume',
      `Are you sure you want to delete "${name}"? This will also delete all associated analyses and job applications. This action cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeResume(id);
            trackEvent('resume_deleted');
          },
        },
      ],
    );
  };

  const handleAddResume = (): void => {
    navigation.navigate(ROUTES.UPLOAD_RESUME);
  };

  const handleViewDetail = (id: string): void => {
    navigation.navigate(ROUTES.RESUME_DETAIL, {resumeId: id});
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
        <AppCard style={styles.headerCard}>
          <AppCard.Content>
            <Text style={styles.headerTitle}>My Resumes</Text>
            <Text style={styles.headerSubtitle}>
              {resumes.length === 0
                ? 'Add your first resume to get started.'
                : `You have ${resumes.length} resume${resumes.length === 1 ? '' : 's'}.`}
            </Text>
          </AppCard.Content>
        </AppCard>

        {sortedResumes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No resumes yet.</Text>
            <PrimaryButton label="Add Resume" onPress={handleAddResume} />
          </View>
        ) : (
          <View style={styles.list}>
            {sortedResumes.map(resume => {
              const isCurrent = resume.id === currentResumeId;
              const isRenaming = renamingId === resume.id;

              return (
                <AppCard key={resume.id} style={[styles.itemCard, isCurrent && styles.activeCard]}>
                  <AppCard.Content>
                    <View style={styles.itemHeader}>
                      {isRenaming ? (
                        <AppTextInput
                          value={renameValue}
                          onChangeText={setRenameValue}
                          dense
                          style={styles.renameInput}
                          autoFocus
                          onSubmitEditing={() => {
                            if (renamingId && renameValue.trim()) {
                              updateResume(renamingId, {name: renameValue.trim()});
                            }
                            setRenamingId(null);
                            setRenameValue('');
                          }}
                        />
                      ) : (
                        <Text style={styles.itemTitle}>{resume.name}</Text>
                      )}
                      {isCurrent ? (
                        <View style={styles.activeBadge}>
                          <Text style={styles.activeBadgeText}>Active</Text>
                        </View>
                      ) : null}
                    </View>

                    <Text style={styles.itemMeta}>
                      {resume.sourceType === 'pdf' ? 'PDF' : 'Text'} • Last used {formatDate(resume.lastUsedAt)}
                    </Text>

                    <AppDivider style={styles.itemDivider} />

                    <View style={styles.itemActions}>
                      <AppButton mode="text" onPress={() => handleViewDetail(resume.id)}>
                        View
                      </AppButton>
                      <AppButton mode="text" onPress={() => handleStartRename(resume.id, resume.name)}>
                        Rename
                      </AppButton>
                      <AppButton mode="text" onPress={() => handleDelete(resume.id, resume.name)} textColor="#B91C1C">
                        Delete
                      </AppButton>
                    </View>

                    {!isCurrent ? (
                      <PrimaryButton
                        label="Use this resume"
                        onPress={() => handleSelect(resume.id)}
                        fullWidth={false}
                      />
                    ) : null}
                  </AppCard.Content>
                </AppCard>
              );
            })}
          </View>
        )}

        <View style={styles.addButton}>
          <PrimaryButton
            label="Add Resume"
            onPress={handleAddResume}
          />
          <PrimaryButton
            label="Create from scratch"
            onPress={() => {
              const id = createEmptyResume();
              navigation.navigate(ROUTES.RESUME_EDITOR, {resumeId: id});
            }}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 16,
  },
  headerCard: {
    borderRadius: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
  },
  emptyState: {
    gap: 16,
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
  },
  list: {
    gap: 12,
  },
  itemCard: {
    borderRadius: 16,
  },
  activeCard: {
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  itemMeta: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
  },
  itemDivider: {
    marginVertical: 12,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    marginTop: 8,
  },
  renameInput: {
    flex: 1,
  },
});
