/**
 * Neobrutalist Card Component
 *
 * A card with thick borders and offset shadow.
 */

import { StyleSheet, View, type ViewStyle } from "react-native";

import {
  borderRadius,
  borderWidth,
  colors,
  shadows,
  spacing,
} from "@/lib/theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "default" | "muted";
}

export function Card({ children, style, variant = "default" }: CardProps) {
  return (
    <View
      style={[
        styles.container,
        variant === "muted" && styles.muted,
        shadows.base,
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardContent({ children, style }: CardContentProps) {
  return <View style={[styles.content, style]}>{children}</View>;
}

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardHeader({ children, style }: CardHeaderProps) {
  return <View style={[styles.header, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondaryBackground,
    borderWidth: borderWidth.base,
    borderColor: colors.border,
    borderRadius: borderRadius.base,
    overflow: "hidden",
  },
  muted: {
    opacity: 0.6,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: borderWidth.base,
    borderBottomColor: colors.border,
  },
});
