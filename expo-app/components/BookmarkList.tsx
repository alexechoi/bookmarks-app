/**
 * Bookmark List Component
 *
 * Displays a list of bookmarks with loading and empty states.
 */

import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { BookmarkCard } from "@/components/BookmarkCard";
import { Button } from "@/components/ui";
import {
  type Bookmark,
  getBookmarks,
  getUnreadBookmarks,
} from "@/lib/firebase/bookmarks";
import {
  borderRadius,
  borderWidth,
  colors,
  shadows,
  spacing,
  typography,
} from "@/lib/theme";

interface BookmarkListProps {
  userId: string;
  filter: "all" | "unread";
  refreshTrigger?: number;
}

export function BookmarkList({
  userId,
  filter,
  refreshTrigger,
}: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async () => {
    if (!userId) {
      setBookmarks([]);
      setIsLoading(false);
      return;
    }

    setError(null);

    try {
      const data =
        filter === "unread"
          ? await getUnreadBookmarks(userId)
          : await getBookmarks(userId);
      setBookmarks(data);
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
      setError("Failed to load bookmarks");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId, filter]);

  useEffect(() => {
    setIsLoading(true);
    fetchBookmarks();
  }, [fetchBookmarks, refreshTrigger]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBookmarks();
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.main} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          variant="outline"
          onPress={fetchBookmarks}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </Button>
      </View>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <View style={styles.centered}>
        <View style={[styles.emptyIcon, shadows.base]}>
          <Ionicons name="bookmark" size={28} color={colors.mainForeground} />
        </View>
        <Text style={styles.emptyTitle}>
          {filter === "unread" ? "All caught up!" : "No bookmarks yet"}
        </Text>
        <Text style={styles.emptyText}>
          {filter === "unread"
            ? "You've read all your saved links."
            : "Tap + to add your first link."}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={bookmarks}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <BookmarkCard
          userId={userId}
          bookmark={item}
          onUpdate={fetchBookmarks}
        />
      )}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.main}
          colors={[colors.main]}
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.heading.fontWeight,
    color: colors.destructive,
    marginBottom: spacing.lg,
  },
  retryButton: {
    marginTop: spacing.sm,
  },
  retryText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.heading.fontWeight,
    color: colors.foreground,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.base,
    borderWidth: borderWidth.base,
    borderColor: colors.border,
    backgroundColor: colors.main,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.heading.fontWeight,
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    textAlign: "center",
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  separator: {
    height: spacing.md,
  },
});
