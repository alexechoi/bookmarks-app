/**
 * Add Screen Placeholder
 *
 * This screen is never actually shown - the tab press opens a modal instead.
 * Required by expo-router for the tab to exist.
 */

import { Redirect } from "expo-router";

export default function AddScreen() {
  // Redirect to index if somehow navigated here directly
  return <Redirect href="/(app)" />;
}
