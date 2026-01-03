"use client";

import { BookmarkIcon, CheckCircleIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { sendPasswordResetEmail } from "@/app/lib/firebase/auth";
import { getFirebaseErrorMessage } from "@/app/lib/firebase/errors";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mx-auto mb-4 size-12 rounded-base border-2 border-border bg-chart-4 flex items-center justify-center">
                <CheckCircleIcon className="size-6 text-main-foreground" />
              </div>
              <h1 className="text-2xl font-heading">Check your email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We&apos;ve sent a password reset link to {email}
              </p>
            </div>

            <div className="mt-6 rounded-base border-2 border-chart-4 bg-chart-4/10 px-4 py-3 text-sm">
              Click the link in the email to reset your password. If you
              don&apos;t see it, check your spam folder.
            </div>

            <Link href="/auth/login" className="block mt-6">
              <Button className="w-full">Back to sign in</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="size-8 rounded-base border-2 border-border bg-main flex items-center justify-center">
                <BookmarkIcon className="size-4 text-main-foreground" />
              </div>
              <span className="font-heading">LinkMind</span>
            </Link>
            <h1 className="text-2xl font-heading">Reset password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-base border-2 border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="you@example.com"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending..." : "Send reset link"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-foreground hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
