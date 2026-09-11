import '../global.css';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/theme';

const grimoireNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: COLORS.background,
    card: COLORS.backgroundElevated,
    primary: COLORS.gold,
    text: COLORS.textPrimary,
    border: COLORS.border,
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={grimoireNavigationTheme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}
