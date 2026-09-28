import React from 'react';
import {StyleProp, StyleSheet, Text, TextStyle, View} from 'react-native';
import {colors, typography, spacing, shadows} from '../../app/theme/designTokens';

type InfoBannerTone =
  | 'primary'
  | 'primaryLighter'
  | 'blue'
  | 'proTip'
  | 'retention'
  | 'delight'
  | 'violet'
  | 'success'
  | 'neutral';

interface InfoBannerProps {
  title: string;
  message: string;
  icon?: string;
  tone?: InfoBannerTone;
  style?: object;
  titleStyle?: StyleProp<TextStyle>;
  messageStyle?: StyleProp<TextStyle>;
}

export const InfoBanner = ({
  title,
  message,
  icon = 'i',
  tone = 'primary',
  style,
  titleStyle,
  messageStyle,
}: InfoBannerProps): React.JSX.Element => (
  <View style={[styles.container, styles[`${tone}Container`], style]}>
    <View style={[styles.icon, styles[`${tone}Icon`]]}>
      <Text style={[styles.iconText, styles[`${tone}IconText`]]}>{icon}</Text>
    </View>
    <View style={styles.content}>
      <Text style={[styles.title, styles[`${tone}Title`], titleStyle]}>{title}</Text>
      <Text style={[styles.message, styles[`${tone}Message`], messageStyle]}>{message}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
    ...shadows.card,
  },
  primaryContainer: {
    backgroundColor: colors.primaryTintLight,
  },
  primaryLighterContainer: {
    backgroundColor: colors.primaryTintLighter,
  },
  blueContainer: {
    backgroundColor: colors.surfaceTint,
  },
  proTipContainer: {
    backgroundColor: colors.blueTint,
  },
  retentionContainer: {
    backgroundColor: colors.surfaceTint,
  },
  delightContainer: {
    backgroundColor: colors.primaryTintLighter,
  },
  violetContainer: {
    backgroundColor: colors.violetTint,
  },
  successContainer: {
    backgroundColor: colors.greenTint,
  },
  neutralContainer: {
    backgroundColor: colors.surfaceTint,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryIcon: {
    backgroundColor: colors.primaryTint,
  },
  primaryLighterIcon: {
    backgroundColor: colors.primary,
  },
  blueIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  proTipIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  retentionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.blueTint,
  },
  delightIcon: {
    backgroundColor: colors.violetTint,
  },
  violetIcon: {
    backgroundColor: colors.violet,
  },
  successIcon: {
    backgroundColor: colors.green,
  },
  neutralIcon: {
    backgroundColor: colors.borderStrong,
  },
  iconText: {
    ...typography.badge,
    color: colors.surface,
  },
  blueIconText: {
    color: colors.primaryDark,
  },
  proTipIconText: {
    color: colors.primaryDark,
  },
  retentionIconText: {
    color: colors.primaryDark,
  },
  delightIconText: {
    color: colors.violet,
  },
  successIconText: {
    color: colors.surface,
  },
  violetIconText: {
    color: colors.surface,
  },
  primaryIconText: {
    color: colors.primaryDark,
  },
  primaryLighterIconText: {
    color: colors.surface,
  },
  neutralIconText: {
    color: colors.surface,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.12,
    color: colors.textPrimary,
  },
  proTipTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: -0.07,
    color: colors.textPrimary,
  },
  retentionTitle: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.55,
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  primaryTitle: {},
  primaryLighterTitle: {},
  blueTitle: {},
  delightTitle: {},
  violetTitle: {},
  successTitle: {},
  neutralTitle: {},
  primaryMessage: {},
  primaryLighterMessage: {},
  blueMessage: {},
  retentionMessage: {},
  delightMessage: {},
  violetMessage: {},
  successMessage: {},
  neutralMessage: {},
  proTipMessage: {
    lineHeight: 21,
  },
  message: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    color: colors.textSecondary,
  },
});
