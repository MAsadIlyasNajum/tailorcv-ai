import React from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {colors} from '../app/theme/designTokens';

interface AppCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

interface AppCardContentProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

interface AppCardTitleProps {
  title: string;
  subtitle?: string;
}

const AppCardBase = ({children, style}: AppCardProps): React.JSX.Element => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const AppCardContent = ({children, style}: AppCardContentProps): React.JSX.Element => {
  return <View style={[styles.content, style]}>{children}</View>;
};

const AppCardTitle = ({title, subtitle}: AppCardTitleProps): React.JSX.Element => {
  return (
    <View style={styles.titleContainer}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

export const AppCard = Object.assign(AppCardBase, {
  Content: AppCardContent,
  Title: AppCardTitle,
}) as React.FC<AppCardProps> & {
  Content: React.FC<AppCardContentProps>;
  Title: React.FC<AppCardTitleProps>;
};

export {AppCardContent, AppCardTitle};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 24,
    fontFamily: 'Inter',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 20,
    fontFamily: 'Inter',
  },
});
