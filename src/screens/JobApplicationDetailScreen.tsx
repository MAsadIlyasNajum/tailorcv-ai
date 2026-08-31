import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AppCard, AppDivider} from '../components';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp, NativeStackScreenProps} from '@react-navigation/native-stack';

import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {useResumeStore} from '../store/useResumeStore';
import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ROUTES} from '../constants/routes';

type Props = NativeStackScreenProps<AppStackParamList, typeof ROUTES.JOB_APPLICATION_DETAIL>;

export const JobApplicationDetailScreen = ({route}: Props): React.JSX.Element => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const {jobApplicationId} = route.params;
  const jobApplications = useResumeStore(state => state.jobApplications);
  const analysisResults = useResumeStore(state => state.analysisResults);
  const resumes = useResumeStore(state => state.resumes);

  const application = useMemo(
    () => jobApplications.find(a => a.id === jobApplicationId) ?? null,
    [jobApplications, jobApplicationId],
  );

  const relatedAnalysis = useMemo(
    () =>
      analysisResults.find(a => a.jobApplicationId === jobApplicationId) ?? null,
    [analysisResults, jobApplicationId],
  );

  const resume = useMemo(
    () => (relatedAnalysis ? resumes.find(r => r.id === relatedAnalysis.resumeId) : null),
    [resumes, relatedAnalysis],
  );

  if (!application) {
    return (
      <ScreenContainer scroll>
        <View style={styles.wrapper}>
          <AppCard style={styles.card}>
            <AppCard.Content>
              <Text style={styles.notFound}>Application not found.</Text>
              <PrimaryButton label="Back to History" onPress={() => navigation.goBack()} />
            </AppCard.Content>
          </AppCard>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
        <AppCard style={styles.card}>
          <AppCard.Title
            title={application.jobTitle ?? 'Untitled application'}
            subtitle={application.companyName ?? 'No company specified'}
          />
          <AppCard.Content>
            <Text style={styles.sectionTitle}>Job Description</Text>
            <Text style={styles.bodyText}>{application.jobDescription}</Text>

            <AppDivider style={styles.divider} />

            <Text style={styles.sectionTitle}>Details</Text>
            <Text style={styles.bodyText}>
              Status: {application.status === 'active' ? 'Active' : 'Archived'}
            </Text>
            <Text style={styles.bodyText}>
              Created: {new Date(application.createdAt).toLocaleString()}
            </Text>
            <Text style={styles.bodyText}>
              Updated: {new Date(application.updatedAt).toLocaleString()}
            </Text>

            {resume ? (
              <>
                <AppDivider style={styles.divider} />
                <Text style={styles.sectionTitle}>Resume</Text>
                <Text style={styles.bodyText}>{resume.name}</Text>
              </>
            ) : null}
          </AppCard.Content>
        </AppCard>

        {relatedAnalysis ? (
          <AppCard style={styles.card}>
            <AppCard.Title title="Analysis" subtitle={`${relatedAnalysis.matchScore}% Match`} />
            <AppCard.Content>
              <View style={styles.analysisRow}>
                <View style={styles.analysisHeader}>
                  <Text style={styles.analysisTitle}>Match Score</Text>
                  <Text style={styles.analysisScore}>{relatedAnalysis.matchScore}%</Text>
                </View>
              </View>
              <View style={styles.analysisRow}>
                <Text style={styles.analysisTitle}>Matching Keywords</Text>
                <Text style={styles.analysisBody}>
                  {relatedAnalysis.matchingKeywords.length
                    ? relatedAnalysis.matchingKeywords.join(', ')
                    : 'None'}
                </Text>
              </View>
              <View style={styles.analysisRow}>
                <Text style={styles.analysisTitle}>Missing Keywords</Text>
                <Text style={styles.analysisBody}>
                  {relatedAnalysis.missingKeywords.length
                    ? relatedAnalysis.missingKeywords.join(', ')
                    : 'None'}
                </Text>
              </View>
              <View style={styles.actions}>
                <PrimaryButton
                  label="View Full Analysis"
                  onPress={() =>
                    navigation.navigate(ROUTES.ANALYSIS_RESULT, {analysisId: relatedAnalysis.id})
                  }
                />
                <PrimaryButton
                  label="Edit Suggestions"
                  onPress={() =>
                    navigation.navigate(ROUTES.EDIT_SUGGESTIONS, {analysisId: relatedAnalysis.id})
                  }
                  fullWidth={false}
                />
              </View>
            </AppCard.Content>
          </AppCard>
        ) : (
          <AppCard style={styles.card}>
            <AppCard.Content>
              <Text style={styles.emptyText}>No analysis yet for this application.</Text>
            </AppCard.Content>
          </AppCard>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 16,
  },
  card: {
    borderRadius: 16,
  },
  notFound: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 4,
  },
  bodyText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  divider: {
    marginVertical: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
  },
  analysisRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 4,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analysisTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  analysisScore: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },
  analysisBody: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  actions: {
    gap: 12,
    marginTop: 12,
  },
});
