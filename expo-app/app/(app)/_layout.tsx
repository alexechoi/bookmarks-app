import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddBookmarkModal } from "@/components/AddBookmarkModal";
import { useAuth } from "@/components/AuthProvider";
import { BookmarkProvider, useBookmarks } from "@/components/BookmarkContext";
import {
  borderRadius,
  borderWidth,
  colors,
  shadows,
  spacing,
  typography,
} from "@/lib/theme";

function TabsLayout() {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const { triggerRefresh } = useBookmarks();
  const insets = useSafeAreaInsets();

  const handleBookmarkAdded = () => {
    triggerRefresh();
  };

  // Calculate tab bar height based on platform and safe area
  const tabBarHeight = Platform.OS === "android" ? 60 + insets.bottom : 80;
  const tabBarPaddingBottom =
    Platform.OS === "android"
      ? Math.max(insets.bottom, spacing.sm)
      : spacing.md;

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: [
            styles.tabBar,
            {
              height: tabBarHeight,
              paddingBottom: tabBarPaddingBottom,
            },
          ],
          tabBarActiveTintColor: colors.foreground,
          tabBarInactiveTintColor: colors.muted,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Links",
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
                <Ionicons
                  name={focused ? "bookmark" : "bookmark-outline"}
                  size={22}
                  color={focused ? colors.mainForeground : color}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: "",
            tabBarIcon: () => (
              <Pressable
                style={[styles.addButton, shadows.base]}
                onPress={() => setAddModalVisible(true)}
              >
                <Ionicons name="add" size={28} color={colors.mainForeground} />
              </Pressable>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setAddModalVisible(true);
            },
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
                <Ionicons
                  name={focused ? "person" : "person-outline"}
                  size={22}
                  color={focused ? colors.mainForeground : color}
                />
              </View>
            ),
          }}
        />
      </Tabs>

      <AddBookmarkModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onBookmarkAdded={handleBookmarkAdded}
      />
    </>
  );
}

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.main} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <BookmarkProvider>
      <TabsLayout />
    </BookmarkProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  tabBar: {
    backgroundColor: colors.secondaryBackground,
    borderTopWidth: borderWidth.base,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  tabBarLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.heading.fontWeight,
    marginTop: spacing.sm,
  },
  tabBarItem: {
    paddingTop: spacing.xs,
    gap: spacing.xs,
  },
  tabIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.base,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  tabIconActive: {
    backgroundColor: colors.main,
    borderWidth: borderWidth.base,
    borderColor: colors.border,
    ...shadows.sm,
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.base,
    borderWidth: borderWidth.base,
    borderColor: colors.border,
    backgroundColor: colors.main,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
});
