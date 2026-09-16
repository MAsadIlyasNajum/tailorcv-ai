import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, typography, spacing, borderRadius, shadows} from '../app/theme/designTokens';

interface TailorQueueItemProps {
  jobTitle: string;
  company?: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  progress?: number;
  matchScore?: number;
  matchLabel?: string;
  queuePosition?: number;
  onOpen?: () => void;
  style?: any;
}

const statusConfig: Record<string, {label: string; color: string; bg: string}> = {
  queued: {label: 'In Queue', color: colors.amber, bg: colors.primaryTintLight},
  running: {label: 'Running', color: colors.primary, bg: colors.primaryTintLight},
  done: {label: 'Done', color: colors.green, bg: colors.greenTint},
  failed: {label: 'Failed', color: colors.red, bg: colors.redTint},
};

export const TailorQueueItem = ({
  jobTitle,
  company,
  status,
  progress,
  matchScore,
  matchLabel,
  queuePosition,
  onOpen,
  style,
}: TailorQueueItemProps): React.JSX.Element => {
  const cfg = statusConfig[status] ?? statusConfig.queued;

  return (
    <Pressable onPress={onOpen} style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>{jobTitle}</Text>
          {company ? <Text style={styles.company}>{company}</Text> : null}
        </View>
        <View style={[styles.statusPill, {backgroundColor: cfg.bg}]}>
          <Text style={[styles.statusText, {color: cfg.color}]}>{cfg.label}</Text>
        </View>
      </View>

      {status === 'queued' && queuePosition !== undefined ? (
        <Text style={styles.position}>Position #{queuePosition} in queue</Text>
      ) : null}

      {status === 'running' && progress !== undefined ? (
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, {width: `${progress}%` as any}]} />
          </View>
          <Text style={styles.progressLabel}>{progress}%</Text>
        </View>
      ) : null}

      {matchScore !== undefined ? (
        <View style={styles.scoreRow}>
          <View style={styles.scoreWrap}>
            <Text style={styles.scoreValue}>{matchScore}</Text>
            <Text style={styles.scoreLabel}>/100</Text>
          </View>
          {matchLabel ? (
            <View style={[styles.matchPill, {backgroundColor: colors.greenTint}]}>
              <Text style={[styles.matchPillText, {color: colors.greenStrong}]}>{matchLabel}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  company: {
    ...typography.body,
    color: colors.textTertiary,
    marginTop: 2,
  },
  statusPill: {
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    ...typography.badge,
    fontWeight: '700',
  },
  position: {
    ...typography.body,
    color: colors.textTertiary,
  },
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.primaryTintLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressLabel: {
    ...typography.badge,
    color: colors.primary,
    width: 36,
    textAlign: 'right',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  scoreValue: {
    ...typography.h2,
    fontSize: 24,
    color: colors.primary,
  },
  scoreLabel: {
    ...typography.body,
    color: colors.textTertiary,
  },
  matchPill: {
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  matchPillText: {
    ...typography.badge,
    fontSize: 12,
    lineHeight: 15,
  },
});

export default TailorQueueItem;