import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Card, Divider} from 'react-native-paper';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {PrimaryButton} from '../components/common/PrimaryButton';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {ROUTES} from '../constants/routes';
import {useResumeStore} from '../store/useResumeStore';
import type {AppStackParamList} from '../app/navigation/AppNavigator';

type Props = NativeStackScreenProps<AppStackParamList, typeof ROUTES.HOME>;

export const HomeScreen = ({navigation}: Props): React.JSX.Element => {
  const analysisResult = useResumeStore(state => state.analysisResult);

  const summaryText = useMemo(() => {
    if (!analysisResult) {
      return 'No analysis yet. Upload your resume and paste a job description to get started.';
    }

    return `Score: ${analysisResult.matchScore}% | Missing keywords: ${analysisResult.missingKeywords.length}`;
  }, [analysisResult]);

  return (
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
        <Card style={styles.logoCard}>
          <Card.Content>
            <Text style={styles.logoTitle}>
              TailorCV AI
            </Text>
            <Text style={styles.logoSubtitle}>
              ATS-optimized resume tailoring assistant
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.actions}>
          <PrimaryButton
            label="Upload Resume"
            onPress={() => navigation.navigate(ROUTES.UPLOAD_RESUME)}
          />
          <PrimaryButton
            label="Paste Job Description"
            onPress={() => navigation.navigate(ROUTES.JOB_DESCRIPTION)}
          />
          <PrimaryButton
            label="Professional Experience"
            onPress={() => navigation.navigate(ROUTES.EXPERIENCE_EDITOR)}
          />
          <PrimaryButton
            label="Settings"
            onPress={() => navigation.navigate(ROUTES.SETTINGS)}
          />
        </View>

        <Divider style={styles.divider} />

        <Card style={styles.resultCard}>
          <Card.Title title="Latest Analysis" />
          <Card.Content>
            <Text style={styles.summaryText}>{summaryText}</Text>
          </Card.Content>
        </Card>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 20,
  },
  logoCard: {
    borderRadius: 16,
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  logoSubtitle: {
    fontSize: 15,
    color: '#475569',
    marginTop: 6,
  },
  actions: {
    gap: 12,
  },
  divider: {
    marginVertical: 2,
  },
  resultCard: {
    borderRadius: 16,
  },
  summaryText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
});
