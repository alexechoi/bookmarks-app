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
import {
  signInWithApple,
  signInWithEmail,
  signInWithGoogle,
} from "@/lib/firebase/auth";
import { getFirebaseErrorMessage } from "@/lib/firebase/errors";
import {
  borderRadius,
  borderWidth,
  colors,
  shadows,
  spacing,
  typography,
} from "@/lib/theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await signInWithEmail(email, password);
      router.replace("/(app)");
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();
      router.replace("/(app)");
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleAppleSignIn() {
    setError("");
    setLoading(true);

    try {
      await signInWithApple();
      router.replace("/(app)");
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {/* OAuth Buttons */}
          <View style={styles.oauthButtons}>
            <Button
              variant="neutral"
              onPress={handleGoogleSignIn}
              disabled={loading}
            >
              <Ionicons
                name="logo-google"
                size={20}
                color={colors.foreground}
              />
              <Text style={styles.oauthButtonText}>Continue with Google</Text>
            </Button>

            <Button
              variant="neutral"
              onPress={handleAppleSignIn}
              disabled={loading}
            >
              <Ionicons name="logo-apple" size={20} color={colors.foreground} />
              <Text style={styles.oauthButtonText}>Continue with Apple</Text>
            </Button>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
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
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Label>Password</Label>
                <Link href="/(auth)/forgot-password" asChild>
                  <Pressable>
                    <Text style={styles.forgotLink}>Forgot password?</Text>
                  </Pressable>
                </Link>
              </View>
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <Button onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.mainForeground} size="small" />
              ) : (
                <Text style={styles.buttonText}>Sign in</Text>
              )}
            </Button>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <Pressable>
                <Text style={styles.footerLink}>Sign up</Text>
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
  },
  oauthButtons: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  oauthButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.heading.fontWeight,
    color: colors.foreground,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: borderWidth.base,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.sm,
    color: colors.muted,
    textTransform: "uppercase",
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
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgotLink: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
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
