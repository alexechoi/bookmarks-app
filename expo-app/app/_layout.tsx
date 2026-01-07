import { Slot, useRouter } from "expo-router";
import { ShareIntentProvider } from "expo-share-intent";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/components/AuthProvider";
import {
  registerBackgroundHandler,
  usePushNotifications,
} from "@/hooks/usePushNotifications";
import { colors } from "@/lib/theme";

// Register background message handler before React renders
registerBackgroundHandler();

function PushNotificationHandler() {
  usePushNotifications({
    showForegroundAlert: true,
    onNotificationReceived: (notification) => {
      // Handle foreground notifications here
      console.log("Notification received:", notification);
    },
    onNotificationPressed: (notification) => {
      // Handle notification tap (navigation, etc.)
      console.log("Notification pressed:", notification);
    },
  });

  return null;
}

export default function RootLayout() {
  const router = useRouter();

  return (
    <ShareIntentProvider
      options={{
        debug: __DEV__,
        resetOnBackground: true,
        onResetShareIntent: () => {
          // When share intent is reset (app goes to background), go to main screen
          router.replace("/(app)");
        },
      }}
    >
      <SafeAreaProvider>
        <AuthProvider>
          <PushNotificationHandler />
          <View style={styles.container}>
            <StatusBar style="dark" />
            <Slot />
          </View>
        </AuthProvider>
      </SafeAreaProvider>
    </ShareIntentProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
