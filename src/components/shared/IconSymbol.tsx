import React from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {colors, typography} from '../app/theme/designTokens';

type IconName =
  | 'home'
  | 'resumes'
  | 'ats'
  | 'profile'
  | 'back'
  | 'search'
  | 'clear'
  | 'arrowRight'
  | 'check'
  | 'close'
  | 'more'
  | 'edit'
  | 'document'
  | 'sparkle'
  | 'shield'
  | 'lock'
  | 'pdf'
  | 'share'
  | 'download'
  | 'calendar'
  | 'location'
  | 'mail'
  | 'phone'
  | 'globe'
  | 'github'
  | 'plus'
  | 'arrowUp'
  | 'chevronRight'
  | 'tailor'
  | 'ai';

const GLYPH: Record<IconName, string> = {
  home: '🏠',
  resumes: '📄',
  ats: '🎯',
  profile: '👤',
  back: '←',
  search: '🔍',
  clear: '✕',
  arrowRight: '→',
  check: '✓',
  close: '✕',
  more: '⋮',
  edit: '✎',
  document: '📄',
  sparkle: '✦',
  shield: '🛡',
  lock: '🔒',
  pdf: '/catalog',
  share: '📤',
  download: '⬇',
  calendar: '📅',
  location: '📍',
  mail: '✉',
  phone: '📞',
  globe: '🌐',
  github: 'Cat',
  plus: '+',
  arrowUp: '↑',
  chevronRight: '›',
  tailor: '✦',
  ai: '✦',
};

interface IconSymbolProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const IconSymbol = ({name, size = 20, color = colors.textTertiary, style}: IconSymbolProps): React.JSX.Element => {
  return (
    <View style={[styles.icon, {width: size, height: size}, style]}>
      <Text style={[styles.glyph, {fontSize: size, color}]}>{GLYPH[name] ?? '•'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    lineHeight: 24,
  },
});

export default IconSymbol;