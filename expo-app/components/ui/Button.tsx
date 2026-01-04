/**
 * Neobrutalist Button Component
 *
 * A bold button with thick borders and offset shadows.
 */

import { forwardRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import {
  borderRadius,
  borderWidth,
  colors,
  shadows,
  spacing,
  typography,
} from "@/lib/theme";

export type ButtonVariant =
  | "default"
  | "neutral"
  | "outline"
  | "ghost"
  | "destructive";
export type ButtonSize = "default" | "sm" | "lg" | "icon";

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button = forwardRef<
  React.ComponentRef<typeof Pressable>,
  ButtonProps
>(function Button(
  {
    children,
    variant = "default",
    size = "default",
    disabled = false,
    loading = false,
    onPress,
    style,
    textStyle,
  },
  ref
) {
  const isDisabled = disabled || loading;

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case "default":
        return {
          container: {
            backgroundColor: colors.main,
            borderColor: colors.border,
          },
          text: {
            color: colors.mainForeground,
          },
        };
      case "neutral":
        return {
          container: {
            backgroundColor: colors.secondaryBackground,
            borderColor: colors.border,
          },
          text: {
            color: colors.foreground,
          },
        };
      case "outline":
        return {
          container: {
            backgroundColor: "transparent",
            borderColor: colors.border,
          },
          text: {
            color: colors.foreground,
          },
        };
      case "ghost":
        return {
          container: {
            backgroundColor: "transparent",
            borderColor: "transparent",
            ...shadows.none,
          },
          text: {
            color: colors.foreground,
          },
        };
      case "destructive":
        return {
          container: {
            backgroundColor: colors.destructive,
            borderColor: colors.border,
          },
          text: {
            color: "#ffffff",
          },
        };
      default:
        return {
          container: {},
          text: {},
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case "default":
        return {
          container: {
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
          },
          text: {
            fontSize: typography.sizes.base,
          },
        };
      case "sm":
        return {
          container: {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
          text: {
            fontSize: typography.sizes.sm,
          },
        };
      case "lg":
        return {
          container: {
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.lg,
          },
          text: {
            fontSize: typography.sizes.lg,
          },
        };
      case "icon":
        return {
          container: {
            width: 40,
            height: 40,
            paddingHorizontal: 0,
            paddingVertical: 0,
          },
          text: {},
        };
      default:
        return {
          container: {
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
          },
          text: {
            fontSize: typography.sizes.base,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        variant !== "ghost" && (pressed ? shadows.pressed : shadows.base),
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variantStyles.text.color}
          size={size === "sm" ? "small" : "small"}
        />
      ) : typeof children === "string" ? (
        <Text
          style={[styles.text, variantStyles.text, sizeStyles.text, textStyle]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: borderWidth.base,
    borderRadius: borderRadius.base,
    gap: spacing.sm,
  },
  text: {
    fontWeight: typography.heading.fontWeight,
  },
  pressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
