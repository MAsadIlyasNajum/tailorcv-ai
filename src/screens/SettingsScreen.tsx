import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {Card, Switch} from 'react-native-paper';

import {ScreenContainer} from '../components/common/ScreenContainer';

export const SettingsScreen = (): React.JSX.Element => {
  const [localOnly, setLocalOnly] = React.useState(true);

  return (
    <ScreenContainer>
      <Card style={styles.card}>
        <Card.Title title="Settings" subtitle="MVP 1" />
        <Card.Content style={styles.row}>
          <Text style={styles.label}>Local-only processing mode</Text>
          <Switch value={localOnly} onValueChange={setLocalOnly} />
        </Card.Content>
        <Card.Content>
          <Text style={styles.helpText}>
            Analytics, sync, and account settings are intentionally excluded in MVP 1.
          </Text>
        </Card.Content>
      </Card>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  helpText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    marginTop: 8,
  },
});
