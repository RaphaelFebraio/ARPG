/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // DECISION: the app is dark-only by design (docs/ARCHITECTURE.md), not a
  // light/dark toggle following the OS. NativeWind's default 'media' mode
  // throws if anything tries to set the color scheme programmatically
  // (which React Navigation's ThemeProvider does); 'class' mode avoids that
  // since we never use Tailwind's `dark:` variant anyway.
  darkMode: 'class',
  theme: {
    extend: {
      // DECISION: token names follow docs/ARCHITECTURE.md's design section
      // (dark grimoire theme — gold/amber primary, ruby/emerald accents).
      colors: {
        background: {
          DEFAULT: '#1A1A2E',
          elevated: '#16213E',
        },
        gold: '#D4A574',
        ruby: '#C84B31',
        emerald: '#2D6A4F',
        ink: '#F2ECE4',
        muted: '#A9A3B8',
        hairline: '#2E2E48',
      },
      // DECISION: RN's fontFamily only understands a single platform font
      // name, not a CSS font-stack, so we override Tailwind's default
      // 'sans'/'serif' stacks with the generic native family names.
      fontFamily: {
        serif: ['serif'],
        sans: ['sans-serif'],
      },
    },
  },
  plugins: [],
};
