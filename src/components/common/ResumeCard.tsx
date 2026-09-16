import React from 'react';
import {GestureResponderEvent, StyleSheet, Text, View, Pressable} from 'react-native';
import {colors} from '../../app/theme/designTokens';
import type {Resume} from '../../types/resume';

interface ResumeCardProps {
  resume: Resume;
  atsScore?: number;
  isCurrent?: boolean;
  onPress?: () => void;
  onOverflowPress?: () => void;
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = Date.now();
  const diffDays = Math.floor((now - timestamp) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return '1d ago';
  if (diffDays < 30) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

const formatAtsLabel = (score: number): string => {
  if (score >= 80) return 'ATS';
  if (score >= 60) return 'ATS';
  if (score >= 40) return 'ATS';
  return 'ATS';
};

const getAtsBadgeConfig = (score: number): {bg: string; text: string} => {
  if (score >= 80) return {bg: colors.green, text: colors.greenBadgeText};
  if (score >= 60) return {bg: colors.blueTintLight, text: colors.primary};
  if (score >= 40) return {bg: colors.blueTintLight, text: colors.primary};
  return {bg: colors.redLight, text: colors.redText};
};

export const ResumeCard = ({
  resume,
  atsScore,
  isCurrent = false,
  onPress,
  onOverflowPress,
}: ResumeCardProps): React.JSX.Element => {
  const handlePress = (): void => {
    onPress?.();
  };

  const handleOverflowPress = (e: GestureResponderEvent): void => {
    e.stopPropagation();
    onOverflowPress?.();
  };

  const name = resume.name || 'Untitled Resume';

  return (
    <Pressable
      onPress={handlePress}
      style={({pressed}) => [
        styles.card,
        isCurrent && styles.currentCard,
        pressed && {opacity: 0.85},
      ]}>
      <View style={styles.cardContent}>
        <View style={styles.leftSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📄</Text>
          </View>
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{name}</Text>
              {atsScore !== undefined && (
                <View
                  style={[
                    styles.atsBadge,
                    {backgroundColor: getAtsBadgeConfig(atsScore).bg},
                  ]}>
                  <Text
                    style={[
                      styles.atsBadgeText,
                      {color: getAtsBadgeConfig(atsScore).text},
                    ]}>
                    {atsScore} {formatAtsLabel(atsScore)}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.metadata}>
              Updated {formatDate(resume.lastUsedAt)}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={handleOverflowPress}
          style={({pressed}) => [styles.overflowButton, pressed && {opacity: 0.5}]}
          hitSlop={8}>
          <Text style={styles.overflowIcon}>⋮</Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    padding: 16,
  },
  currentCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  atsBadge: {
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  atsBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
  metadata: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textTertiary,
    lineHeight: 16,
  },
  overflowButton: {
    padding: 4,
    marginLeft: 8,
  },
  overflowIcon: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: '400',
  },
});
