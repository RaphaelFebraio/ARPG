// DECISION: hex values for background/gold/ruby/emerald come straight from
// the design spec (docs/ARCHITECTURE.md). Text/border tones aren't
// specified there, so we pick warm, low-contrast-safe complements that
// keep WCAG AA contrast against the dark background.
// Kept in sync by hand with tailwind.config.js's `theme.extend.colors` —
// this file exists for the few places that need a literal color value
// (navigation theme, icon `color` props) instead of a className.
export const COLORS = {
  background: '#1A1A2E',
  backgroundElevated: '#16213E',
  gold: '#D4A574',
  ruby: '#C84B31',
  emerald: '#2D6A4F',
  textPrimary: '#F2ECE4',
  textSecondary: '#A9A3B8',
  border: '#2E2E48',
} as const;

export const FONTS = {
  serif: 'serif',
  sans: 'sans-serif',
} as const;
