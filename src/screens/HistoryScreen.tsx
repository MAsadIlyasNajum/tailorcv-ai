import React, {useMemo, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {AppButton, AppCard, AppDivider, AtsRadialGauge, InfoBanner, SearchFilterBar} from '../components';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {useResumeStore} from '../store/useResumeStore';
import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ROUTES} from '../constants/routes';
import {trackEvent} from '../services/analytics/analytics';
import {colors} from '../app/theme/designTokens';

type Props = NativeStackScreenProps<AppStackParamList, typeof ROUTES.HISTORY>;

export const HistoryScreen = ({navigation}: Props): React.JSX.Element => {
  const analysisResults = useResumeStore(state => state.analysisResults);
  const jobApplications = useResumeStore(state => state.jobApplications);
  const resumes = useResumeStore(state => state.resumes);
  const finalResumeOutput = useResumeStore(state => state.finalResumeOutput);
  const removeAnalysisResult = useResumeStore(state => state.removeAnalysisResult);

  const enriched = useMemo(() => {
    return analysisResults
      .map(result => {
        const application = jobApplications.find(a => a.id === result.jobApplicationId);
        const resume = resumes.find(r => r.id === result.resumeId);
        return {
          result,
          application,
          resume,
        };
      })
      .filter(item => item.application)
      .sort((a, b) => b.result.updatedAt - a.result.updatedAt);
  }, [analysisResults, jobApplications, resumes]);

  const totalMatches = enriched.length;
  const averageMatch = useMemo(() => {
    if (enriched.length === 0) {
      return 0;
    }
    const sum = enriched.reduce((acc, item) => acc + item.result.matchScore, 0);
    return Math.round(sum / enriched.length);
  }, [enriched]);

  const [searchQuery, setSearchQuery] = useState('');
  const [rangeFilter, setRangeFilter] = useState<'all' | '7d' | '30d'>('all');

  const filteredEnriched = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const rangeMs = rangeFilter === '7d' ? 7 * 24 * 60 * 60 * 1000 : rangeFilter === '30d' ? 30 * 24 * 60 * 60 * 1000 : 0;
    const cutoff = rangeMs > 0 ? Date.now() - rangeMs : 0;
    return enriched.filter(item => {
      const application = item.application;
      if (rangeMs > 0 && item.result.createdAt < cutoff) {
        return false;
      }
      if (query) {
        const haystack = `${application?.jobTitle ?? ''} ${application?.companyName ?? ''} ${item.resume?.name ?? ''}`.toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [enriched, searchQuery, rangeFilter]);

  const rangeFilters = useMemo(
    () => [
      {label: 'All time', value: 'all'},
      {label: '7 days', value: '7d'},
      {label: '30 days', value: '30d'},
    ],
    [],
  );

  React.useEffect(() => {
    trackEvent('history_opened');
  }, []);

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
        <View style={styles.titleBlock}>
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>
            {enriched.length === 0
              ? 'Your past analyses will appear here.'
              : `${enriched.length} past analysis${enriched.length === 1 ? '' : 's'}.`}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalMatches}</Text>
            <Text style={styles.statLabel}>Total analyses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{averageMatch}%</Text>
            <Text style={styles.statLabel}>Average match</Text>
          </View>
        </View>

        <SearchFilterBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by company or role..."
          filters={rangeFilters}
          selectedFilter={rangeFilter}
          onSelectFilter={value => setRangeFilter(value as 'all' | '7d' | '30d')}
        />

        <InfoBanner
          tone="retention"
          style={styles.fullBleedBanner}
          title="Retention & privacy"
          message="Analyses are stored locally on this device. Delete any entry at any time; nothing is uploaded to the cloud."
        />

        {filteredEnriched.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No analyses yet.</Text>
            <PrimaryButton
              label="Start Analysis"
              onPress={() => navigation.navigate(ROUTES.UPLOAD_RESUME)}
            />
          </View>
        ) : (
          <View style={styles.list}>
            {filteredEnriched.map(({result, application, resume}) => (
              <AppCard key={result.id} style={styles.itemCard}>
                <AppCard.Content>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>
                      {application?.jobTitle ?? 'Untitled role'} {application?.companyName ? `@ ${application.companyName}` : ''}
                    </Text>
                    <View style={styles.scoreGauge}>
                      <AtsRadialGauge score={result.matchScore} size={48} fontSize={12} />
                    </View>
                  </View>
                  <Text style={styles.itemMeta}>
                    {resume?.name ?? 'Unknown resume'} • {formatDate(result.createdAt)}
                  </Text>
                  <AppDivider style={styles.itemDivider} />
                  <View style={styles.itemActions}>
                    <AppButton mode="text" fullWidth={false} onPress={() => {
                      trackEvent('analysis_viewed');
                      navigation.navigate(ROUTES.ANALYSIS_RESULT, {analysisId: result.id});
                    }}>
                      View
                    </AppButton>
                    <AppButton
                      mode="text"
                      fullWidth={false}
                      onPress={() =>
                        navigation.navigate(ROUTES.EDIT_SUGGESTIONS, {
                          analysisId: result.id,
                        })
                      }>
                      Edit Suggestions
                    </AppButton>
                    {finalResumeOutput?.analysisId === result.id ? (
                      <AppButton mode="text" fullWidth={false} onPress={() =>
                        navigation.navigate(ROUTES.FINAL_RESUME_OUTPUT)
                      }>
                        View Final Resume
                      </AppButton>
                    ) : null}
                    <AppButton
                      mode="text"
                      fullWidth={false}
                      onPress={() =>
                        navigation.navigate(ROUTES.JOB_APPLICATION_DETAIL, {
                          jobApplicationId: application!.id,
                        })
                      }>
                      Details
                    </AppButton>
                    <AppButton mode="text" fullWidth={false} onPress={() => {
                      Alert.alert(
                        'Delete analysis',
                        'This will remove this analysis from history. The job application and resume will remain.',
                        [
                          {text: 'Cancel', style: 'cancel'},
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: () => {
                              removeAnalysisResult(result.id);
                              trackEvent('analysis_deleted');
                            },
                          },
                        ],
                      );
                     }} textColor={colors.red}>
                      Delete
                    </AppButton>
                  </View>
                </AppCard.Content>
              </AppCard>
            ))}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 16,
  },
  titleBlock: {
    gap: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.65,
    lineHeight: 34,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.primaryTintLight,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    shadowColor: colors.shadowColor,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.44,
    color: colors.textSecondary,
  },
  fullBleedBanner: {
    marginHorizontal: -16,
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  itemScore: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  scoreGauge: {
    width: 48,
    height: 48,
  },
  itemMeta: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 6,
  },
  itemDivider: {
    marginVertical: 12,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
});
