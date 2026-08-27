import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Card} from 'react-native-paper';

import {ScreenContainer} from '../components/common/ScreenContainer';

export const SettingsScreen = (): React.JSX.Element => {
  return (
    <ScreenContainer scroll>
      <View style={styles.wrapper}>
        <Card style={styles.card}>
          <Card.Title title="Privacy" subtitle="MVP 1" />
          <Card.Content>
            <Text style={styles.sectionTitle}>Resume extraction</Text>
            <Text style={styles.sectionBody}>
              PDF text extraction is processed entirely on your device.
            </Text>

            <View style={styles.spacer} />

            <Text style={styles.sectionTitle}>AI analysis</Text>
            <Text style={styles.sectionBody}>
              Your extracted resume text and job description are sent to Gemini only
              when you tap Analyze. We do not store them on any server.
            </Text>

            <View style={styles.spacer} />

            <Text style={styles.sectionTitle}>Local storage</Text>
            <Text style={styles.sectionBody}>
              Your latest resume, job description, and analysis result are saved
              locally on this device using MMKV so you can resume where you left off.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Coming in MVP 2" subtitle="Roadmap" />
          <Card.Content>
            <Text style={styles.sectionBody}>
              Resume builder, cover letters, interview prep, and cloud sync are
              intentionally excluded from MVP 1.
            </Text>
          </Card.Content>
        </Card>
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
