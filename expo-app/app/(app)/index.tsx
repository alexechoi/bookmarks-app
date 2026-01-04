/**
 * Links Screen (Dashboard)
 *
 * Main screen showing user's bookmarks with tabs for filtering.
 */

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/components/AuthProvider";
import { useBookmarks } from "@/components/BookmarkContext";
import { BookmarkList } from "@/components/BookmarkList";
import { Badge } from "@/components/ui";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import {
  borderRadius,
  borderWidth,
  colors,
  shadows,
  spacing,
  typography,
} from "@/lib/theme";

export default function LinksScreen() {
  const { user } = useAuth();
  const { refreshTrigger, triggerRefresh } = useBookmarks();
  const [activeTab, setActiveTab] = useState<"unread" | "all">("unread");
  const [notificationsEnabled] = useState(true);

  // Initialize push notifications
  usePushNotifications({
    onNotificationReceived: (notification) => {
      console.log("Notification received:", notification.title);
      triggerRefresh();
    },
    onNotificationPressed: (notification) => {
      console.log("Notification pressed:", notification.title);
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.secondaryBackground}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.logo, shadows.sm]}>
            <Ionicons name="bookmark" size={16} color={colors.mainForeground} />
          </View>
          <Text style={styles.logoText}>LinkMind</Text>
        </View>

        {/* Notification Badge */}
        {notificationsEnabled && (
          <Badge variant="success" style={styles.notifBadge}>
            <Ionicons
              name="notifications"
              size={10}
              color={colors.mainForeground}
            />
            <Text style={styles.notifText}>On</Text>
          </Badge>
        )}
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>Your Links</Text>
        <Text style={styles.subtitle}>Tap a link to open it</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <Pressable
          style={[
            styles.filterTab,
            activeTab === "unread" && styles.filterTabActive,
          ]}
          onPress={() => setActiveTab("unread")}
        >
          <Text
            style={[
              styles.filterTabText,
              activeTab === "unread" && styles.filterTabTextActive,
            ]}
          >
            Unread
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.filterTab,
            activeTab === "all" && styles.filterTabActive,
          ]}
          onPress={() => setActiveTab("all")}
        >
          <Text
            style={[
              styles.filterTabText,
              activeTab === "all" && styles.filterTabTextActive,
            ]}
          >
            All
          </Text>
        </Pressable>
      </View>

      {/* Bookmark List */}
      <View style={styles.listContainer}>
        {user && (
          <BookmarkList
            userId={user.uid}
            filter={activeTab}
            refreshTrigger={refreshTrigger}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.secondaryBackground,
    borderBottomWidth: borderWidth.base,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.base,
    borderWidth: borderWidth.base,
    borderColor: colors.border,
    backgroundColor: colors.main,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.heading.fontWeight,
    color: colors.foreground,
  },
  notifBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  notifText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.heading.fontWeight,
    color: colors.mainForeground,
  },
  titleSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes["2xl"],
    fontWeight: typography.heading.fontWeight,
    color: colors.foreground,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    marginTop: 2,
  },
  filterTabs: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.base,
    borderWidth: borderWidth.base,
    borderColor: colors.border,
    backgroundColor: colors.secondaryBackground,
  },
  filterTabActive: {
    backgroundColor: colors.main,
  },
  filterTabText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.heading.fontWeight,
    color: colors.foreground,
  },
  filterTabTextActive: {
    color: colors.mainForeground,
  },
  listContainer: {
    flex: 1,
  },
});
