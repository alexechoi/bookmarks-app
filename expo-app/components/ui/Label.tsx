/**
 * Neobrutalist Label Component
 *
 * A text label for form fields.
 */

import { StyleSheet, Text, type TextStyle } from "react-native";

import { colors, typography } from "@/lib/theme";

interface LabelProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export function Label({ children, style }: LabelProps) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.heading.fontWeight,
    color: colors.foreground,
    marginBottom: 6,
  },
});
