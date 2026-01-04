/**
 * Neobrutalist Input Component
 *
 * A styled text input with thick borders.
 */

import { forwardRef } from "react";
import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
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

interface InputProps extends Omit<TextInputProps, "style"> {
  style?: ViewStyle;
  inputStyle?: TextStyle;
  error?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { style, inputStyle, error = false, ...props },
  ref,
) {
  return (
    <View
      style={[
        styles.container,
        error && styles.containerError,
        shadows.sm,
        style,
      ]}
    >
      <TextInput
        ref={ref}
        style={[styles.input, inputStyle]}
        placeholderTextColor={colors.muted}
        {...props}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondaryBackground,
    borderWidth: borderWidth.base,
    borderColor: colors.border,
    borderRadius: borderRadius.base,
  },
  containerError: {
    borderColor: colors.destructive,
  },
  input: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.foreground,
    fontWeight: typography.body.fontWeight,
  },
});
