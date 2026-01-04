/**
 * Bookmark Card Component
 *
 * Displays a single bookmark with actions to mark as read/unread, delete, and open.
 * Optimized for mobile with swipe-friendly touch targets.
 */

import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Badge, Card, CardContent } from "@/components/ui";
import {
  type Bookmark,
  deleteBookmark,
  getReminderLabel,
  markBookmarkAsRead,
  markBookmarkAsUnread,
} from "@/lib/firebase/bookmarks";
import {
  borderRadius,
  borderWidth,
  colors,
  shadows,
  spacing,
  typography,
} from "@/lib/theme";

interface BookmarkCardProps {
  userId: string;
  bookmark: Bookmark;
  onUpdate?: () => void;
}

export function BookmarkCard({
  userId,
  bookmark,
  onUpdate,
}: BookmarkCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState<
    "read" | "unread" | "delete" | null
  >(null);
  const [faviconError, setFaviconError] = useState(false);

  const handleMarkAsRead = async () => {
    setIsLoading(true);
    setActionType("read");
    try {
      await markBookmarkAsRead(userId, bookmark.id);
      onUpdate?.();
    } catch (error) {
      console.error("Error marking as read:", error);
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  const handleMarkAsUnread = async () => {
    setIsLoading(true);
    setActionType("unread");
    try {
      await markBookmarkAsUnread(
        userId,
        bookmark.id,
        bookmark.reminderInterval,
      );
      onUpdate?.();
    } catch (error) {
      console.error("Error marking as unread:", error);
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Bookmark",
      "Are you sure you want to delete this bookmark?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            setActionType("delete");
            try {
              await deleteBookmark(userId, bookmark.id);
              onUpdate?.();
            } catch (error) {
              console.error("Error deleting bookmark:", error);
            } finally {
              setIsLoading(false);
              setActionType(null);
            }
          },
        },
      ],
    );
  };

  const handleOpenLink = async () => {
    try {
      await Linking.openURL(bookmark.url);
      await handleMarkAsRead();
    } catch (error) {
      console.error("Error opening link:", error);
      Alert.alert("Error", "Could not open this link");
    }
  };

  const domain = (() => {
    try {
      return new URL(bookmark.url).hostname.replace("www.", "");
    } catch {
      return bookmark.url;
    }
  })();

  const formattedDate = (() => {
    try {
      return bookmark.createdAt.toDate().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  })();

  const nextReminderDate = (() => {
    try {
      return bookmark.nextReminderAt.toDate().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  })();

  return (
    <Pressable onPress={handleOpenLink}>
      <Card variant={bookmark.isRead ? "muted" : "default"}>
        <CardContent style={styles.cardContent}>
          {/* Top row: Favicon, Title, Badge */}
          <View style={styles.topRow}>
            {/* Favicon */}
            {bookmark.favicon && !faviconError ? (
              <Image
                source={{ uri: bookmark.favicon }}
                style={styles.favicon}
                onError={() => setFaviconError(true)}
              />
            ) : (
              <View style={[styles.faviconPlaceholder, shadows.sm]}>
                <Ionicons
                  name="globe-outline"
                  size={16}
                  color={colors.mainForeground}
                />
              </View>
            )}

            {/* Title & Domain */}
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {bookmark.title || domain}
              </Text>
              <Text style={styles.domain} numberOfLines={1}>
                {domain}
              </Text>
            </View>

            {/* Badge */}
            <Badge variant={bookmark.isRead ? "secondary" : "default"}>
              {bookmark.isRead ? "Read" : "Unread"}
            </Badge>
          </View>

          {/* Description */}
          {bookmark.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {bookmark.description}
            </Text>
          ) : null}

          {/* Meta & Actions Row */}
          <View style={styles.bottomRow}>
            {/* Meta info */}
            <View style={styles.meta}>
              <Text style={styles.metaText}>{formattedDate}</Text>
              {!bookmark.isRead && (
                <>
                  <Text style={styles.metaDot}>•</Text>
                  <Ionicons
                    name="time-outline"
                    size={10}
                    color={colors.muted}
                  />
                  <Text style={styles.metaText}>
                    {nextReminderDate} (
                    {getReminderLabel(bookmark.reminderInterval)})
                  </Text>
                </>
              )}
            </View>

            {/* Action Buttons - Icon only for mobile */}
            <View style={styles.actions}>
              {bookmark.isRead ? (
                <Pressable
                  style={styles.actionButton}
                  onPress={handleMarkAsUnread}
                  disabled={isLoading}
                  hitSlop={8}
                >
                  {isLoading && actionType === "unread" ? (
                    <ActivityIndicator size="small" color={colors.foreground} />
                  ) : (
                    <Ionicons
                      name="refresh"
                      size={18}
                      color={colors.foreground}
                    />
                  )}
                </Pressable>
              ) : (
                <Pressable
                  style={styles.actionButton}
                  onPress={handleMarkAsRead}
                  disabled={isLoading}
                  hitSlop={8}
                >
                  {isLoading && actionType === "read" ? (
                    <ActivityIndicator size="small" color={colors.success} />
                  ) : (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={colors.success}
                    />
                  )}
                </Pressable>
              )}

              <Pressable
                style={styles.actionButton}
                onPress={handleDelete}
                disabled={isLoading}
                hitSlop={8}
              >
                {isLoading && actionType === "delete" ? (
                  <ActivityIndicator size="small" color={colors.destructive} />
                ) : (
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={colors.destructive}
                  />
                )}
              </Pressable>
            </View>
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    padding: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  favicon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.base,
    borderWidth: borderWidth.base,
    borderColor: colors.border,
  },
  faviconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.base,
    borderWidth: borderWidth.base,
    borderColor: colors.border,
    backgroundColor: colors.main,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: typography.sizes.base,
    fontWeight: typography.heading.fontWeight,
    color: colors.foreground,
  },
  domain: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
    marginTop: 1,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
  },
  metaText: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
  },
  metaDot: {
    fontSize: typography.sizes.xs,
    color: colors.muted,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  actionButton: {
    padding: spacing.xs,
  },
});
