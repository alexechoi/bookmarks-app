/**
 * Add Bookmark Modal Component
 *
 * A bottom sheet style modal for adding new bookmarks.
 * Optimized for mobile with larger touch targets.
 */

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button, Input, Label } from "@/components/ui";
import { apiPost } from "@/lib/api";
import { type ReminderInterval } from "@/lib/firebase/bookmarks";
import {
  borderRadius,
  borderWidth,
  colors,
  shadows,
  spacing,
  typography,
} from "@/lib/theme";

interface AddBookmarkModalProps {
  visible: boolean;
  onClose: () => void;
  onBookmarkAdded?: () => void;
  /** Pre-fill the URL field (e.g., from share intent) */
  initialUrl?: string;
}

interface BookmarkResponse {
  id: string;
  url: string;
  title: string;
  description: string;
  favicon: string;
  reminder_interval: ReminderInterval;
  next_reminder_at: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

const REMINDER_OPTIONS: {
  value: ReminderInterval;
  label: string;
  shortLabel: string;
}[] = [
  { value: "3s", label: "3 seconds (test)", shortLabel: "3s" },
  { value: "1d", label: "1 day", shortLabel: "1d" },
  { value: "3d", label: "3 days", shortLabel: "3d" },
  { value: "1w", label: "1 week", shortLabel: "1w" },
  { value: "1m", label: "1 month", shortLabel: "1m" },
];

export function AddBookmarkModal({
  visible,
  onClose,
  onBookmarkAdded,
  initialUrl,
}: AddBookmarkModalProps) {
  const [url, setUrl] = useState("");
  const [reminderInterval, setReminderInterval] =
    useState<ReminderInterval>("1d");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill URL when initialUrl changes (e.g., from share intent)
  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
    }
  }, [initialUrl]);

  const handleSubmit = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    // Basic URL validation
    let validUrl = url.trim();
    if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
      validUrl = "https://" + validUrl;
    }

    try {
      new URL(validUrl);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiPost<BookmarkResponse>("/bookmarks", {
        url: validUrl,
        reminder_interval: reminderInterval,
      });

      setUrl("");
      setReminderInterval("1d");
      onClose();
      onBookmarkAdded?.();
    } catch (err) {
      console.error("Error adding bookmark:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add bookmark. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUrl("");
    setReminderInterval("1d");
    setError(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={handleClose} />

        {/* Bottom Sheet */}
        <View style={[styles.sheet, shadows.base]}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Add Link</Text>
              <Pressable onPress={handleClose} hitSlop={12}>
                <Ionicons name="close" size={24} color={colors.foreground} />
              </Pressable>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Label>Paste URL</Label>
                <Input
                  value={url}
                  onChangeText={setUrl}
                  placeholder="https://example.com/article"
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Label>Remind me in</Label>
                <View style={styles.reminderOptions}>
                  {REMINDER_OPTIONS.map((option) => (
                    <Pressable
                      key={option.value}
                      style={[
                        styles.reminderOption,
                        reminderInterval === option.value &&
                          styles.reminderOptionSelected,
                      ]}
                      onPress={() => setReminderInterval(option.value)}
                      disabled={isLoading}
                    >
                      <Text
                        style={[
                          styles.reminderOptionText,
                          reminderInterval === option.value &&
                            styles.reminderOptionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button onPress={handleSubmit} disabled={isLoading} size="lg">
                {isLoading ? (
                  <ActivityIndicator
                    color={colors.mainForeground}
                    size="small"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="bookmark"
                      size={18}
                      color={colors.mainForeground}
                    />
                    <Text style={styles.saveText}>Save Link</Text>
                  </>
                )}
              </Button>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sheet: {
    backgroundColor: colors.secondaryBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: borderWidth.base,
    borderBottomWidth: 0,
    borderColor: colors.border,
    maxHeight: "80%",
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.muted,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.heading.fontWeight,
    color: colors.foreground,
  },
  form: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  reminderOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  reminderOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.base,
    borderWidth: borderWidth.base,
    borderColor: colors.border,
    backgroundColor: colors.secondaryBackground,
  },
  reminderOptionSelected: {
    backgroundColor: colors.main,
    borderColor: colors.border,
  },
  reminderOptionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.heading.fontWeight,
    color: colors.foreground,
  },
  reminderOptionTextSelected: {
    color: colors.mainForeground,
  },
  errorContainer: {
    backgroundColor: colors.destructiveLight,
    borderRadius: borderRadius.base,
    borderWidth: borderWidth.base,
    borderColor: colors.destructive,
    padding: spacing.md,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.destructive,
  },
  actions: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  saveText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.heading.fontWeight,
    color: colors.mainForeground,
  },
});
