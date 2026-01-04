import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";

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
  return (
    <AuthProvider>
      <PushNotificationHandler />
      <View style={styles.container}>
        <StatusBar style="dark" />
        <Slot />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
