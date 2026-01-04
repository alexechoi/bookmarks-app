import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button, Input, Label } from "@/components/ui";
import { sendPasswordResetEmail } from "@/lib/firebase/auth";
import { getFirebaseErrorMessage } from "@/lib/firebase/errors";
import {
  borderRadius,
  borderWidth,
  colors,
  shadows,
  spacing,
  typography,
} from "@/lib/theme";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(email);
      setSuccess(true);
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <View style={[styles.successIcon, shadows.base]}>
              <Ionicons
                name="checkmark-circle"
                size={28}
                color={colors.mainForeground}
              />
            </View>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.subtitle}>
              We&apos;ve sent a password reset link to {email}
            </Text>
          </View>

          {/* Success Message */}
          <View style={styles.successContainer}>
            <Text style={styles.successText}>
              Click the link in the email to reset your password. If you
              don&apos;t see it, check your spam folder.
            </Text>
          </View>

          <Button onPress={() => router.replace("/(auth)/login")}>
            <Text style={styles.buttonText}>Back to sign in</Text>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={[styles.logo, shadows.base]}>
              <Ionicons
                name="bookmark"
                size={20}
                color={colors.mainForeground}
              />
            </View>
            <Text style={styles.logoText}>LinkMind</Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Reset password</Text>
            <Text style={styles.subtitle}>
              Enter your email and we&apos;ll send you a reset link
            </Text>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Label>Email</Label>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                autoFocus
              />
            </View>

            <Button onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.mainForeground} size="small" />
              ) : (
                <Text style={styles.buttonText}>Send reset link</Text>
              )}
            </Button>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={styles.footerLink}>Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  logo: {
    width: 36,
    height: 36,
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
  successIconContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.base,
    borderWidth: borderWidth.base,
    borderColor: colors.border,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: "center",
  },
  title: {
    fontSize: typography.sizes["2xl"],
    fontWeight: typography.heading.fontWeight,
    color: colors.foreground,
    letterSpacing: typography.heading.letterSpacing,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.muted,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: colors.destructiveLight,
    borderRadius: borderRadius.base,
    borderWidth: borderWidth.base,
    borderColor: colors.destructive,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.destructive,
    fontSize: typography.sizes.sm,
  },
  successContainer: {
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.base,
    borderWidth: borderWidth.base,
    borderColor: colors.success,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
  },
  successText: {
    color: colors.foreground,
    fontSize: typography.sizes.sm,
    lineHeight: 22,
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  buttonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.heading.fontWeight,
    color: colors.mainForeground,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  footerText: {
    color: colors.muted,
    fontSize: typography.sizes.sm,
  },
  footerLink: {
    color: colors.foreground,
    fontSize: typography.sizes.sm,
    fontWeight: typography.heading.fontWeight,
    textDecorationLine: "underline",
  },
});
