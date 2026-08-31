import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AppButton, AppCard, AppDivider} from '../components';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp, NativeStackScreenProps} from '@react-navigation/native-stack';

import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {useResumeStore} from '../store/useResumeStore';
import type {AppStackParamList} from '../app/navigation/AppNavigator';
import {ROUTES} from '../constants/routes';
import {runStructuredExtraction} from '../services/ai/extractResumeUseCase';

type Props = NativeStackScreenProps<AppStackParamList, typeof ROUTES.RESUME_DETAIL>;

export const ResumeDetailScreen = ({route}: Props): React.JSX.Element => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const {resumeId} = route.params;
  const resumes = useResumeStore(state => state.resumes);
  const analysisResults = useResumeStore(state => state.analysisResults);
  const isExtracting = useResumeStore(state => state.isExtracting);

  const handleExtract = async (): Promise<void> => {
    const proposal = await runStructuredExtraction();
    if (proposal) {
      navigation.navigate(ROUTES.RESUME_EXTRACTION_REVIEW as never, {resumeId} as never);
    }
  };

  const resume = useMemo(
    () => resumes.find(r => r.id === resumeId) ?? null,
    [resumes, resumeId],
  );

  const relatedAnalyses = useMemo(
    () =>
      analysisResults
        .filter(a => a.resumeId === resumeId)
        .sort((a, b) => b.createdAt - a.createdAt),
    [analysisResults, resumeId],
  );

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!resume) {
    return (
      <ScreenContainer scroll>
        <View style={styles.wrapper}>
          <AppCard style={styles.card}>
            <AppCard.Content>
              <Text style={styles.notFound}>Resume not found.</Text>
              <PrimaryButton label="Back to Resumes" onPress={() => navigation.goBack()} />
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
          <AppCard.Title title={resume.name} subtitle={`${resume.sourceType === 'pdf' ? 'PDF' : 'Text'} resume`} />
          <AppCard.Content>
            <Text style={styles.sectionTitle}>Resume Text</Text>
            <Text style={styles.bodyText}>{resume.text}</Text>

            <AppDivider style={styles.divider} />

            <Text style={styles.sectionTitle}>Details</Text>
            <Text style={styles.bodyText}>Created: {formatDate(resume.createdAt)}</Text>
            <Text style={styles.bodyText}>Updated: {formatDate(resume.updatedAt)}</Text>
            <Text style={styles.bodyText}>Last used: {formatDate(resume.lastUsedAt)}</Text>

            {resume.metadata ? (
              <>
                <AppDivider style={styles.divider} />
                <Text style={styles.sectionTitle}>File</Text>
                <Text style={styles.bodyText}>{resume.metadata.fileName ?? resume.name}</Text>
                <Text style={styles.bodyText}>
                  {resume.metadata.fileSize
                    ? `${(resume.metadata.fileSize / 1024).toFixed(1)} KB`
                    : ''}
                </Text>
              </>
            ) : null}
          </AppCard.Content>
        </AppCard>

        <AppCard style={styles.card}>
          <AppCard.Title title={`Analyses (${relatedAnalyses.length})`} />
          <AppCard.Content>
            {relatedAnalyses.length === 0 ? (
              <Text style={styles.emptyText}>No analyses yet for this resume.</Text>
            ) : (
              relatedAnalyses.map(analysis => (
                <View key={analysis.id} style={styles.analysisRow}>
                  <View style={styles.analysisHeader}>
                    <Text style={styles.analysisTitle}>
                      {analysis.jobTitle ?? 'Untitled role'} {analysis.companyName ? `@ ${analysis.companyName}` : ''}
                    </Text>
                    <Text style={styles.analysisScore}>{analysis.matchScore}%</Text>
                  </View>
                  <Text style={styles.analysisMeta}>{formatDate(analysis.createdAt)}</Text>
                  <AppButton mode="text" onPress={() => navigation.navigate(ROUTES.ANALYSIS_RESULT, {analysisId: analysis.id})}>
                    View Analysis
                  </AppButton>
                </View>
              ))
            )}
          </AppCard.Content>
        </AppCard>

        <View style={styles.actions}>
          <PrimaryButton
            label="Extract with AI"
            loading={isExtracting}
            onPress={handleExtract}
          />
          <PrimaryButton
            label="Edit Resume"
            onPress={() => navigation.navigate(ROUTES.RESUME_EDITOR, {resumeId: resume.id})}
          />
          <PrimaryButton
            label="Analyze with Job Description"
            onPress={() => {
              navigation.navigate(ROUTES.JOB_DESCRIPTION as any);
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
    paddingVertical: 10,
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
    flex: 1,
  },
  analysisScore: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
  },
  analysisMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  actions: {
    gap: 12,
  },
});
