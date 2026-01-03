"use client";

import { BookmarkIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/app/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="mx-auto mb-4 size-12 rounded-base border-2 border-border bg-main flex items-center justify-center">
              <BookmarkIcon className="size-6 text-main-foreground" />
            </div>
            <h1 className="text-2xl font-heading">Welcome to LinkMind</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your account or create a new one
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <Link href="/auth/login" className="block">
              <Button className="w-full">Sign in</Button>
            </Link>
            <Link href="/auth/signup" className="block">
              <Button variant="neutral" className="w-full">
                Create account
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link
              href="/"
              className="font-medium text-foreground hover:underline"
            >
              Back to home
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
