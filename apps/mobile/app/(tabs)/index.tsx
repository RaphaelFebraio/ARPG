import { Redirect } from 'expo-router';

// DECISION: the tab group has no route that matches its own root ("/"),
// since each tab lives in its own subfolder (create/, grimoire/, ...).
// This redirects "/" to the default tab instead of showing Expo Router's
// "Unmatched Route" page.
export default function TabsIndex() {
  return <Redirect href="/create" />;
}
