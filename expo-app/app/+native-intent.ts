/**
 * Native Intent Handler for expo-router
 *
 * This file intercepts native intents (like share intents) before expo-router
 * tries to match them to routes. Without this, share intent URLs would show
 * "unmatched route" because they contain query parameters expo-router doesn't understand.
 */

import { getShareExtensionKey } from "expo-share-intent";

export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: string;
}) {
  try {
    // Check if this is a share intent URL
    if (path.includes(`dataUrl=${getShareExtensionKey()}`)) {
      // Redirect to the main app screen where the share intent will be handled
      console.debug("[native-intent] Redirecting share intent to /(app)");
      return "/(app)";
    }
    return path;
  } catch {
    return "/";
  }
}
