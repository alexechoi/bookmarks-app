/**
 * Neobrutalist Badge Component
 *
 * Status indicators with bold styling.
 */

import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import {
  borderRadius,
  borderWidth,
  colors,
  spacing,
  typography,
} from "@/lib/theme";

export type BadgeVariant = "default" | "secondary" | "success" | "destructive";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ children, variant = "default", style }: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "default":
        return {
          container: styles.variantDefault,
          text: styles.textDefault,
        };
      case "secondary":
        return {
          container: styles.variantSecondary,
          text: styles.textSecondary,
        };
      case "success":
        return {
          container: styles.variantSuccess,
          text: styles.textSuccess,
        };
      case "destructive":
        return {
          container: styles.variantDestructive,
          text: styles.textDestructive,
        };
      default:
        return {
          container: {},
          text: {},
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={[styles.container, variantStyles.container, style]}>
      {typeof children === "string" ? (
        <Text style={[styles.text, variantStyles.text]}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.base,
    borderWidth: borderWidth.base,
    gap: spacing.xs,
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.heading.fontWeight,
  },
  variantDefault: {
    backgroundColor: colors.main,
    borderColor: colors.border,
  },
  textDefault: {
    color: colors.mainForeground,
  },
  variantSecondary: {
    backgroundColor: colors.secondaryBackground,
    borderColor: colors.border,
  },
  textSecondary: {
    color: colors.muted,
  },
  variantSuccess: {
    backgroundColor: colors.success,
    borderColor: colors.border,
  },
  textSuccess: {
    color: colors.mainForeground,
  },
  variantDestructive: {
    backgroundColor: colors.destructive,
    borderColor: colors.border,
  },
  textDestructive: {
    color: "#ffffff",
  },
});
