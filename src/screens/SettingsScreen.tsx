import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AppCard} from '../components';

import {ScreenContainer} from '../components/common/ScreenContainer';

export const SettingsScreen = (): React.JSX.Element => {
  return (
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
        <AppCard style={styles.card}>
          <AppCard.Title title="Privacy" subtitle="TailorCV AI" />
          <AppCard.Content>
            <Text style={styles.sectionTitle}>Local-first</Text>
            <Text style={styles.sectionBody}>
              Your resumes, job applications, and analyses are stored only on this
              device. We do not sync them to any cloud backend.
            </Text>

            <View style={styles.spacer} />

            <Text style={styles.sectionTitle}>AI-only data flow</Text>
            <Text style={styles.sectionBody}>
              Resume text and job descriptions are sent to the AI provider only when
              you start an analysis. They are not used for any other purpose and are
              not stored on our servers.
            </Text>

            <View style={styles.spacer} />

            <Text style={styles.sectionTitle}>PDF extraction</Text>
            <Text style={styles.sectionBody}>
              PDF text extraction is processed entirely on your device.
            </Text>

            <View style={styles.spacer} />

            <Text style={styles.sectionTitle}>Crash reporting</Text>
            <Text style={styles.sectionBody}>
              Crash reports may include anonymized technical context. They never
              include your resume text, job description, or personal details.
            </Text>

            <View style={styles.spacer} />

            <Text style={styles.sectionTitle}>Analytics</Text>
            <Text style={styles.sectionBody}>
              We track high-level app events only (for example, analysis started).
              No raw resume text, job description, AI responses, or PII are sent to
              analytics.
            </Text>
          </AppCard.Content>
        </AppCard>

        <AppCard style={styles.card}>
          <AppCard.Title title="Roadmap" subtitle="Coming next" />
          <AppCard.Content>
            <Text style={styles.sectionBody}>
              Resume builder, cover letters, interview prep, and optional cloud
              sync are planned for future releases.
            </Text>
          </AppCard.Content>
        </AppCard>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 14,
  },
  card: {
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionBody: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  spacer: {
    height: 16,
  },
});
