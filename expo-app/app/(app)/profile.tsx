/**
 * Profile Screen
 *
 * Account details and password change form.
 * Simplified header for tab navigation.
 */

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/components/AuthProvider";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Label,
} from "@/components/ui";
import { getAuthProvider, signOut, updatePassword } from "@/lib/firebase/auth";
import { getFirebaseErrorMessage } from "@/lib/firebase/errors";
import { getUserDocument, type UserDocument } from "@/lib/firebase/firestore";
import {
  borderRadius,
  borderWidth,
  colors,
  shadows,
  spacing,
  typography,
} from "@/lib/theme";

export default function ProfileScreen() {
  const { user } = useAuth();
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [authProvider, setAuthProvider] = useState<string | null>(null);

  // Password change form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      if (!user) return;

      try {
        const doc = await getUserDocument(user.uid);
        setUserDoc(doc as UserDocument | null);
        setAuthProvider(getAuthProvider());
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [user]);

  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);

    try {
      await updatePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(getFirebaseErrorMessage(error));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/(auth)/login");
          } catch {
            // Handle error silently
          }
        },
      },
    ]);
  };

  const displayName = userDoc
    ? `${userDoc.firstName} ${userDoc.lastName}`.trim()
    : user?.displayName || "User";

  const displayEmail = userDoc?.email || user?.email || "";

  const canChangePassword = authProvider === "password";

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.main} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.secondaryBackground}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.logo, shadows.sm]}>
              <Ionicons name="person" size={16} color={colors.mainForeground} />
            </View>
            <Text style={styles.logoText}>Profile</Text>
          </View>

          <Pressable
            style={styles.signOutButton}
            onPress={handleSignOut}
            hitSlop={8}
          >
            <Ionicons
              name="log-out-outline"
              size={22}
              color={colors.destructive}
            />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Account Details Card */}
          <Card style={styles.card}>
            <CardHeader>
              <View style={styles.cardTitle}>
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={colors.foreground}
                />
                <Text style={styles.cardTitleText}>Account</Text>
              </View>
            </CardHeader>
            <CardContent>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name</Text>
                <Text style={styles.detailValue}>{displayName}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{displayEmail}</Text>
              </View>

              {userDoc?.phoneNumber && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailValue}>{userDoc.phoneNumber}</Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Sign-in</Text>
                <Text style={styles.detailValue}>
                  {authProvider === "google" && "Google"}
                  {authProvider === "password" && "Email"}
                  {!authProvider && "Unknown"}
                </Text>
              </View>
            </CardContent>
          </Card>

          {/* Password Change Card - Only show for email/password users */}
          {canChangePassword && (
            <Card style={styles.card}>
              <CardHeader>
                <View style={styles.cardTitle}>
                  <Ionicons
                    name="key-outline"
                    size={18}
                    color={colors.foreground}
                  />
                  <Text style={styles.cardTitleText}>Change Password</Text>
                </View>
              </CardHeader>
              <CardContent>
                {passwordError && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{passwordError}</Text>
                  </View>
                )}

                {passwordSuccess && (
                  <View style={styles.successContainer}>
                    <Text style={styles.successText}>Password updated!</Text>
                  </View>
                )}

                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <Label>Current Password</Label>
                    <Input
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      placeholder="••••••••"
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Label>New Password</Label>
                    <Input
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="••••••••"
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Label>Confirm Password</Label>
                    <Input
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="••••••••"
                      secureTextEntry
                    />
                  </View>

                  <Button
                    onPress={handlePasswordChange}
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? (
                      <ActivityIndicator
                        color={colors.mainForeground}
                        size="small"
                      />
                    ) : (
                      <Text style={styles.updateButtonText}>Update</Text>
                    )}
                  </Button>
                </View>
              </CardContent>
            </Card>
          )}

          {/* Info for OAuth users */}
          {!canChangePassword && authProvider && (
            <Card style={styles.card}>
              <CardHeader>
                <View style={styles.cardTitle}>
                  <Ionicons
                    name="key-outline"
                    size={18}
                    color={colors.foreground}
                  />
                  <Text style={styles.cardTitleText}>Password</Text>
                </View>
              </CardHeader>
              <CardContent>
                <Text style={styles.oauthInfo}>
                  Manage your password through your Google account.
                </Text>
              </CardContent>
            </Card>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.secondaryBackground,
    borderBottomWidth: borderWidth.base,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logo: {
    width: 32,
    height: 32,
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
  signOutButton: {
    padding: spacing.sm,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cardTitleText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.heading.fontWeight,
    color: colors.foreground,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  detailLabel: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
  },
  detailValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.heading.fontWeight,
    color: colors.foreground,
  },
  errorContainer: {
    backgroundColor: colors.destructiveLight,
    borderRadius: borderRadius.base,
    borderWidth: borderWidth.base,
    borderColor: colors.destructive,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.destructive,
  },
  successContainer: {
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.base,
    borderWidth: borderWidth.base,
    borderColor: colors.success,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  successText: {
    fontSize: typography.sizes.sm,
    color: colors.foreground,
  },
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  updateButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.heading.fontWeight,
    color: colors.mainForeground,
  },
  oauthInfo: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    lineHeight: 20,
  },
});
