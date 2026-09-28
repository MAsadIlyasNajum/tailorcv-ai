import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, typography, spacing, borderRadius, shadows} from '../../app/theme/designTokens';
import {AtsRadialGauge} from './AtsRadialGauge';

interface AtsAuditCardProps {
  score: number;
  matchLabel?: string;
  auditCount?: number;
  checks?: {label: string; status: 'pass' | 'fail' | 'warn'}[];
  style?: any;
}

export const AtsAuditCard = ({score, matchLabel, auditCount, checks, style}: AtsAuditCardProps): React.JSX.Element => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>ATS Audit</Text>
        {auditCount !== undefined ? <Text style={styles.count}>{auditCount} checks</Text> : null}
      </View>
      <View style={styles.content}>
        <AtsRadialGauge score={score} size={88} fontSize={18} />
        <View style={styles.details}>
          {matchLabel ? (
            <View style={[styles.matchPill, {backgroundColor: colors.greenTint}]}>
              <Text style={[styles.matchPillText, {color: colors.greenStrong}]}>{matchLabel}</Text>
            </View>
          ) : null}
          {checks && checks.length > 0 ? (
            <View style={styles.checksList}>
              {checks.map((check, idx) => (
                <View key={idx} style={styles.checkRow}>
                  <Text style={styles.checkIcon}>
                    {check.status === 'pass' ? '✓' : check.status === 'fail' ? '✕' : '•'}
                  </Text>
                  <Text style={styles.checkLabel}>{check.label}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  count: {
    ...typography.badge,
    color: colors.textTertiary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  details: {
    flex: 1,
    gap: spacing.sm,
  },
  matchPill: {
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  matchPillText: {
    ...typography.badge,
    fontSize: 12,
    lineHeight: 15,
  },
  checksList: {
    gap: 6,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkIcon: {
    color: colors.greenStrong,
    fontSize: 12,
    width: 12,
  },
  checkLabel: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
});

export default AtsAuditCard;