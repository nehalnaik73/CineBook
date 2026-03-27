// CineBook Design System — mirrors the web Tailwind palette exactly
export const Colors = {
  dark:       '#0D0D0D',
  card:       '#1A1A1A',
  cardBorder: '#2A2A2A',
  input:      '#111111',
  red:        '#E50914',
  redDark:    '#b30710',
  muted:      '#888888',
  white:      '#F5F5F5',
  text:       '#F5F5F5',
  subtext:    '#A0A0A0',
  green:      '#4ade80',
  greenDark:  '#166534',
  blue:       '#60a5fa',
  blueDark:   '#1e3a5f',
  yellow:     '#facc15',
}

export const Font = {
  // React Native doesn't support custom fonts out of the box without expo-font
  // Using system fonts that best approximate Bebas Neue / DM Sans feel
  display:  { fontFamily: 'serif',     letterSpacing: 4 },
  body:     { fontFamily: 'System' },
  mono:     { fontFamily: 'monospace' },
}

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 999,
}

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  strong: {
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
}
