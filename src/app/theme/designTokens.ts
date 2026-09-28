export const colors = {
  // Core brand
  primary: '#2563EB',
  primaryDark: '#004AC6',
  primaryTint: '#DBE1FF',
  primaryTintLight: '#F2F3FF',
  primaryTintLighter: '#EAEDFF',

  // Violet accent
  violet: '#712AE2',
  violetTint: '#EADDFF',
  violetTintSoft: '#E2E7FF',

  // Background / surface
  background: '#FAF8FF',
  surface: '#FFFFFF',
  surfaceTint: '#F2F3FF',
  border: '#E2E7FF',
  borderAccent: '#DAE2FD',
  borderStrong: '#C3C6D7',

  // Text
  textPrimary: '#131B2E',
  textSecondary: '#434655',
  textTertiary: '#737686',
  textQuaternary: '#C3C6D7',

  // Green (success / strong match)
  green: '#007D55',
  greenStrong: '#006242',
  greenLight: '#6FFBBE',
  greenTint: '#E2F6EC',
  greenBadgeText: '#BDFFDB',
  greenText: '#002113',
  greenTextDark: '#005236',

  // Red (error / needs improvement)
  red: '#BA1A1A',
  redStrong: '#93000A',
  redLight: '#FFDAD6',
  redText: '#93000A',
  redTint: '#FFDAD6',

  // Amber (good match)
  amber: '#F59E0B',
  amberText: '#25005A',

  // Neutral
  overlayStrong: '#283044',
  shadowColor: '#000',

  // Legacy aliases (kept for backward compat)
  blueTint: '#E2E7FF',
  blueTintLight: '#F2F3FF',
  progressTrack: '#E2E7FF',
  deepViolet: '#00174B',
} as const;

export const typography = {
  h1: {
    fontSize: 26,
    fontWeight: '700' as const,
    lineHeight: 34,
    color: colors.textPrimary,
    fontFamily: 'Inter',
    letterSpacing: -0.65,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
    color: colors.textPrimary,
    fontFamily: 'Inter',
    letterSpacing: -0.18,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    color: colors.textPrimary,
    fontFamily: 'Inter',
    letterSpacing: -0.18,
  },
  h4: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    color: colors.textPrimary,
    fontFamily: 'Inter',
    letterSpacing: -0.07,
  },
  body: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    color: colors.textSecondary,
    fontFamily: 'Inter',
  },
  bodyLarge: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: colors.textSecondary,
    fontFamily: 'Inter',
  },
  bodySemi: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    letterSpacing: -0.07,
  },
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 14,
    color: colors.textTertiary,
    fontFamily: 'Inter',
    letterSpacing: 0.44,
    textTransform: 'uppercase' as const,
  },
  labelSm: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 14,
    color: colors.textTertiary,
    fontFamily: 'Inter',
    letterSpacing: 0.44,
    textTransform: 'uppercase' as const,
  },
  badge: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 14,
    fontFamily: 'Inter',
  },
  badgeSm: {
    fontSize: 10,
    fontWeight: '700' as const,
    lineHeight: 10,
    fontFamily: 'Inter',
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 14,
    fontFamily: 'Inter',
    letterSpacing: 0.44,
  },
  mono: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textTertiary,
    fontFamily: 'JetBrains Mono',
    lineHeight: 16,
  },
  monoSm: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: colors.textTertiary,
    fontFamily: 'JetBrains Mono',
    lineHeight: 16,
  },
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xl2: 24,
  xl3: 32,
  xl4: 40,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 12,
  xl: 12,
  full: 9999,
} as const;

export const shadows = {
  card: {
    shadowColor: colors.shadowColor,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardElevated: {
    shadowColor: colors.shadowColor,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    shadowColor: colors.shadowColor,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  fab: {
    shadowColor: colors.shadowColor,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.10,
    shadowRadius: 15,
    elevation: 12,
  },
} as const;

export const screenPadding = 16;