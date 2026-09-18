import { Stack } from 'expo-router';

// DECISION: without this, Expo Router treats every file under create/
// (subrace, class, abilities, ...) as its own top-level route matched
// against the parent Tabs navigator, leaking all ten wizard steps into
// the bottom tab bar as extra tabs. Wrapping them in a Stack here keeps
// the wizard's step-to-step navigation internal to the "Criar" tab.
export default function CreateStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
