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

import { Button, Checkbox, Input, Label } from "@/components/ui";
import { signInWithGoogle, signUpWithEmail } from "@/lib/firebase/auth";
import { getFirebaseErrorMessage } from "@/lib/firebase/errors";
import { createUserDocument } from "@/lib/firebase/firestore";
import {
  borderRadius,
  borderWidth,
  colors,
  shadows,
  spacing,
  typography,
} from "@/lib/theme";

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
    acceptedPrivacy: false,
    acceptedMarketing: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setError("");

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.acceptedTerms || !formData.acceptedPrivacy) {
      setError("You must accept the Terms of Service and Privacy Policy");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signUpWithEmail(
        formData.email,
        formData.password,
      );

      // Create user document in Firestore
      try {
        await createUserDocument(userCredential.user.uid, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          acceptedMarketing: formData.acceptedMarketing,
        });
      } catch (firestoreErr) {
        console.error("Failed to create user document:", firestoreErr);
      }

      router.replace("/(app)");
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    if (!formData.acceptedTerms || !formData.acceptedPrivacy) {
      setError("You must accept the Terms of Service and Privacy Policy");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithGoogle();
      const user = userCredential.user;

      // Extract name from Google profile
      const displayName = user.displayName || "";
      const nameParts = displayName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      try {
        await createUserDocument(user.uid, {
          firstName,
          lastName,
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
          acceptedMarketing: formData.acceptedMarketing,
        });
      } catch (firestoreErr) {
        console.error("Failed to create user document:", firestoreErr);
      }

      router.replace("/(app)");
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
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
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Get started with your account</Text>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Label>First name</Label>
                <Input
                  value={formData.firstName}
                  onChangeText={(v) => updateField("firstName", v)}
                  placeholder="John"
                  autoComplete="given-name"
                />
              </View>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Label>Last name</Label>
                <Input
                  value={formData.lastName}
                  onChangeText={(v) => updateField("lastName", v)}
                  placeholder="Doe"
                  autoComplete="family-name"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Label>Email</Label>
              <Input
                value={formData.email}
                onChangeText={(v) => updateField("email", v)}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Label>Phone number (optional)</Label>
              <Input
                value={formData.phoneNumber}
                onChangeText={(v) => updateField("phoneNumber", v)}
                placeholder="+1 (555) 000-0000"
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            </View>

            <View style={styles.inputGroup}>
              <Label>Password</Label>
              <Input
                value={formData.password}
                onChangeText={(v) => updateField("password", v)}
                placeholder="••••••••"
                secureTextEntry
                autoComplete="new-password"
              />
            </View>

            <View style={styles.inputGroup}>
              <Label>Confirm password</Label>
              <Input
                value={formData.confirmPassword}
                onChangeText={(v) => updateField("confirmPassword", v)}
                placeholder="••••••••"
                secureTextEntry
                autoComplete="new-password"
              />
            </View>

            {/* Checkboxes */}
            <View style={styles.checkboxGroup}>
              <Checkbox
                checked={formData.acceptedTerms}
                onCheckedChange={(checked) =>
                  updateField("acceptedTerms", checked)
                }
                label="I agree to the Terms of Service"
              />
              <Checkbox
                checked={formData.acceptedPrivacy}
                onCheckedChange={(checked) =>
                  updateField("acceptedPrivacy", checked)
                }
                label="I agree to the Privacy Policy"
              />
              <Checkbox
                checked={formData.acceptedMarketing}
                onCheckedChange={(checked) =>
                  updateField("acceptedMarketing", checked)
                }
                label="I want to receive marketing emails (optional)"
              />
            </View>

            <Button onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.mainForeground} size="small" />
              ) : (
                <Text style={styles.buttonText}>Create account</Text>
              )}
            </Button>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* OAuth Buttons */}
          <View style={styles.oauthButtons}>
            <Button
              variant="neutral"
              onPress={handleGoogleSignUp}
              disabled={loading}
            >
              <Ionicons
                name="logo-google"
                size={20}
                color={colors.foreground}
              />
              <Text style={styles.oauthButtonText}>Sign up with Google</Text>
            </Button>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
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
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  checkboxGroup: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  buttonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.heading.fontWeight,
    color: colors.mainForeground,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.xl,
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
  oauthButtons: {
    gap: spacing.md,
  },
  oauthButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.heading.fontWeight,
    color: colors.foreground,
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
