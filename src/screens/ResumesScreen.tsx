import React, {useMemo, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {AppButton, AppCard, AppDivider, AppTextInput, IconSymbol, InfoBanner, SearchFilterBar} from '../components';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {useResumeStore} from '../store/useResumeStore';
import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ROUTES} from '../constants/routes';
import {trackEvent} from '../services/analytics/analytics';
import {colors, shadows} from '../app/theme/designTokens';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'pdf' | 'text'>('all');

  const filteredResumes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return sortedResumes.filter(resume => {
      if (sourceFilter !== 'all' && resume.sourceType !== sourceFilter) {
        return false;
      }
      if (query && !resume.name.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [sortedResumes, searchQuery, sourceFilter]);

  const sourceFilters = useMemo(
    () => [
      {label: 'All', value: 'all'},
      {label: 'PDF', value: 'pdf'},
      {label: 'Text', value: 'text'},
    ],
    [],
  );

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

  const handleEditResume = (id: string): void => {
    navigation.navigate(ROUTES.RESUME_EDITOR, {resumeId: id});
  };

  const handleTailorResume = (id: string): void => {
    setCurrentResume(id);
    navigation.navigate(ROUTES.JOB_DESCRIPTION);
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
        <View style={styles.topBar}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>My Resumes</Text>
            <View style={styles.countPill}>
              <Text style={styles.countText}>{resumes.length}</Text>
            </View>
          </View>
          <View style={styles.topBarAction}>
            <AppButton
              compact
              fullWidth
              mode="contained"
              label="New Resume"
              onPress={handleAddResume}
              style={styles.topBarButton}
            />
          </View>
        </View>

        <SearchFilterBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by role, company, or keyword..."
          filters={sourceFilters}
          selectedFilter={sourceFilter}
          onSelectFilter={value => setSourceFilter(value as 'all' | 'pdf' | 'text')}
        />

        <InfoBanner
          tone="proTip"
          title="Pro Workflow"
          message="Keep one master resume, then create tailored versions for each role."
        />

        {filteredResumes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No resumes yet.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredResumes.map(resume => {
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
                      <AppButton
                        mode="outlined"
                        fullWidth={false}
                        onPress={() => handleEditResume(resume.id)}
                        style={styles.editAction}
                        labelStyle={styles.editActionLabel}
                        textColor={colors.primaryDark}
                        icon={<IconSymbol name="edit" size={14} color={colors.primaryDark} />}>
                        Edit
                      </AppButton>
                      <AppButton
                        mode="outlined"
                        fullWidth={false}
                        onPress={() => handleTailorResume(resume.id)}
                        style={styles.tailorAction}
                        labelStyle={styles.tailorActionLabel}
                        textColor={colors.amberText}
                        icon={<IconSymbol name="sparkle" size={15} color={colors.violet} />}>
                        Tailor
                      </AppButton>
                    </View>

                    <View style={styles.itemMetaActions}>
                      <AppButton mode="text" fullWidth={false} onPress={() => handleViewDetail(resume.id)}>
                        View
                      </AppButton>
                      <AppButton mode="text" fullWidth={false} onPress={() => handleStartRename(resume.id, resume.name)}>
                        Rename
                      </AppButton>
                      <AppButton
                        mode="text"
                        fullWidth={false}
                        onPress={() => handleDelete(resume.id, resume.name)}
                        textColor={colors.red}>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    minHeight: 48,
    paddingRight: 141,
  },
  titleBlock: {
    flex: 1,
    minWidth: 180,
    gap: 4,
  },
  topBarAction: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 125,
  },
  topBarButton: {
    minHeight: 40,
  },
  countPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.blueTint,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.44,
    color: colors.textSecondary,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.65,
    fontFamily: 'Inter',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyState: {
    gap: 16,
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  list: {
    gap: 12,
  },
  itemCard: {
    borderRadius: 12,
  },
  activeCard: {
    backgroundColor: colors.surface,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: -0.18,
    fontFamily: 'Inter',
    color: colors.textPrimary,
    flex: 1,
  },
  activeBadge: {
    backgroundColor: colors.blueTint,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.44,
    color: colors.primaryDark,
  },
  itemMeta: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.44,
    color: colors.textTertiary,
    marginTop: 6,
  },
  itemDivider: {
    marginVertical: 12,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  editAction: {
    minHeight: 40,
    borderRadius: 8,
    backgroundColor: colors.blueTint,
    borderColor: colors.blueTint,
    paddingHorizontal: 16,
  },
  editActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: -0.07,
  },
  tailorAction: {
    minHeight: 40,
    borderRadius: 8,
    backgroundColor: colors.violetTint,
    borderColor: colors.violetTint,
    paddingHorizontal: 16,
    ...shadows.card,
  },
  tailorActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: -0.07,
  },
  itemMetaActions: {
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
