/**
 * Neobrutalist Checkbox Component
 *
 * A styled checkbox with thick borders.
 */

import {
  Pressable,
  StyleSheet,
  Text,
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

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  style,
}: CheckboxProps) {
  return (
    <Pressable
      style={[styles.container, style]}
      onPress={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
    >
      <View
        style={[
          styles.checkbox,
          checked && styles.checkboxChecked,
          disabled && styles.checkboxDisabled,
          shadows.sm,
        ]}
      >
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      {label && (
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.base,
    borderWidth: borderWidth.base,
    borderColor: colors.border,
    backgroundColor: colors.secondaryBackground,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.main,
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  checkmark: {
    color: colors.mainForeground,
    fontSize: 14,
    fontWeight: "bold",
  },
  label: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.muted,
    lineHeight: 22,
  },
  labelDisabled: {
    opacity: 0.5,
  },
});
