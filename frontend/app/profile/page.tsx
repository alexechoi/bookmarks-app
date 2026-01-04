"use client";

import {
  ArrowLeftIcon,
  BookmarkIcon,
  KeyIcon,
  Loader2Icon,
  MailIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/app/components/AuthProvider";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import { getAuthProvider, updatePassword } from "@/app/lib/firebase/auth";
import { getFirebaseErrorMessage } from "@/app/lib/firebase/errors";
import {
  getUserDocument,
  type UserDocument,
} from "@/app/lib/firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ProfileContent() {
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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const displayName = userDoc
    ? `${userDoc.firstName} ${userDoc.lastName}`.trim()
    : user?.displayName || "User";

  const displayEmail = userDoc?.email || user?.email || "";

  const canChangePassword = authProvider === "password";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-border bg-secondary-background">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-base border-2 border-border bg-main flex items-center justify-center">
              <BookmarkIcon className="size-4 text-main-foreground" />
            </div>
            <h1 className="text-xl font-heading">LinkMind</h1>
          </div>

          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeftIcon className="size-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-heading">Profile Settings</h2>
          <p className="text-muted-foreground text-sm mt-1">
            View and manage your account details.
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserIcon className="size-5" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                    Name
                  </Label>
                  <p className="mt-1 font-medium">{displayName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                    Email
                  </Label>
                  <p className="mt-1 font-medium flex items-center gap-2">
                    <MailIcon className="size-4 text-muted-foreground" />
                    {displayEmail}
                  </p>
                </div>
              </div>

              {userDoc?.phoneNumber && (
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                    Phone Number
                  </Label>
                  <p className="mt-1 font-medium">{userDoc.phoneNumber}</p>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                  Sign-in Method
                </Label>
                <p className="mt-1 font-medium capitalize">
                  {authProvider === "google" && "Google Account"}
                  {authProvider === "password" && "Email & Password"}
                  {!authProvider && "Unknown"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Password Change Card - Only show for email/password users */}
          {canChangePassword && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <KeyIcon className="size-5" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {passwordError && (
                    <div className="rounded-base border-2 border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="rounded-base border-2 border-chart-4 bg-chart-4/10 p-3 text-sm text-foreground">
                      Password updated successfully!
                    </div>
                  )}

                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="mt-1.5"
                    />
                  </div>

                  <Button type="submit" disabled={passwordLoading}>
                    {passwordLoading ? (
                      <>
                        <Loader2Icon className="size-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Info for OAuth users */}
          {!canChangePassword && authProvider && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <KeyIcon className="size-5" />
                  Password Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You signed in with Google. To change your password, please
                  manage it through your Google account settings.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
