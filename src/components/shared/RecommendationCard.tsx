import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, typography, spacing, borderRadius, shadows} from '../app/theme/designTokens';

interface RecommendationCardProps {
  title: string;
  description: string;
  matchScore?: number;
  matchLabel?: string;
  tags?: string[];
  onApply?: () => void;
  onPreview?: () => void;
  style?: any;
}

export const RecommendationCard = ({
  title,
  description,
  matchScore,
  matchLabel,
  tags,
  onApply,
  onPreview,
  style,
}: RecommendationCardProps): React.JSX.Element => {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {matchLabel ? (
            <View style={[styles.matchPill, {backgroundColor: colors.greenTint}]}>
              <Text style={[styles.matchPillText, {color: colors.greenStrong}]}>{matchLabel}</Text>
            </View>
          ) : null}
        </View>
        {matchScore !== undefined ? (
          <View style={styles.scoreWrap}>
            <Text style={styles.scoreValue}>{matchScore}</Text>
            <Text style={styles.scoreLabel}>/100</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.description} numberOfLines={2}>{description}</Text>
      {tags && tags.length > 0 ? (
        <View style={styles.tagsRow}>
          {tags.map((tag, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <View style={styles.actions}>
        {onPreview ? (
          <Pressable onPress={onPreview} style={styles.previewBtn}>
            <Text style={styles.previewText}>Preview</Text>
          </Pressable>
        ) : null}
        {onApply ? (
          <Pressable onPress={onApply} style={styles.applyBtn}>
            <Text style={styles.applyText}>Apply</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
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
    gap: spacing.xs,
  },
  title: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
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
  scoreWrap: {
    alignItems: 'baseline',
    flexDirection: 'row',
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
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.primaryTintLight,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    ...typography.badge,
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  previewBtn: {
    flex: 1,
    backgroundColor: colors.primaryTintLight,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  previewText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  applyBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  applyText: {
    color: colors.surface,
    ...typography.body,
    fontWeight: '600',
  },
});

export default RecommendationCard;