import React, {useMemo} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {AppButton, AppCard} from '../components';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {useResumeStore} from '../store/useResumeStore';
import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ROUTES} from '../constants/routes';
import {trackEvent} from '../services/analytics/analytics';

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
        <AppCard style={styles.headerCard}>
          <AppCard.Content>
            <Text style={styles.headerTitle}>History</Text>
            <Text style={styles.headerSubtitle}>
              {enriched.length === 0
                ? 'Your past analyses will appear here.'
                : `${enriched.length} past analysis${enriched.length === 1 ? '' : 's'}.`}
            </Text>
          </AppCard.Content>
        </AppCard>

        {enriched.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No analyses yet.</Text>
            <PrimaryButton
              label="Start Analysis"
              onPress={() => navigation.navigate(ROUTES.UPLOAD_RESUME)}
            />
          </View>
        ) : (
          <View style={styles.list}>
            {enriched.map(({result, application, resume}) => (
              <AppCard key={result.id} style={styles.itemCard}>
                <AppCard.Content>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemTitle}>
                      {application?.jobTitle ?? 'Untitled role'} {application?.companyName ? `@ ${application.companyName}` : ''}
                    </Text>
                    <Text style={styles.itemScore}>{result.matchScore}%</Text>
                  </View>
                  <Text style={styles.itemMeta}>
                    {resume?.name ?? 'Unknown resume'} • {formatDate(result.createdAt)}
                  </Text>
                  <View style={styles.itemActions}>
                    <AppButton mode="text" onPress={() => {
                      trackEvent('analysis_viewed');
                      navigation.navigate(ROUTES.ANALYSIS_RESULT, {analysisId: result.id});
                    }}>
                      View
                    </AppButton>
                    <AppButton mode="text" onPress={() =>
                      navigation.navigate(ROUTES.EDIT_SUGGESTIONS, {
                        analysisId: result.id,
                      })
                    }>
                      Edit Suggestions
                    </AppButton>
                    {finalResumeOutput?.analysisId === result.id ? (
                      <AppButton mode="text" onPress={() =>
                        navigation.navigate(ROUTES.FINAL_RESUME_OUTPUT)
                      }>
                        View Final Resume
                      </AppButton>
                    ) : null}
                    <AppButton mode="text" onPress={() =>
                      navigation.navigate(ROUTES.JOB_APPLICATION_DETAIL, {
                        jobApplicationId: application!.id,
                      })
                    }>
                      Details
                    </AppButton>
                    <AppButton mode="text" onPress={() => {
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
                    }} textColor="#B91C1C">
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  itemScore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  itemMeta: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
});
