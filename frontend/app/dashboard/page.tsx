"use client";

import { BellIcon, BookmarkIcon, LogOutIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/app/components/AuthProvider";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import { usePushNotifications } from "@/app/components/PushNotificationProvider";
import { signOut } from "@/app/lib/firebase/auth";
import { AddBookmarkDialog } from "@/components/AddBookmarkDialog";
import { BookmarkList } from "@/components/BookmarkList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    isSupported: notificationsSupported,
    isEnabled: notificationsEnabled,
    enableNotifications,
  } = usePushNotifications();

  const [activeTab, setActiveTab] = useState<"unread" | "all">("unread");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/auth/login");
    } catch {
      // Handle error silently
    }
  };

  const handleEnableNotifications = async () => {
    setNotificationLoading(true);
    await enableNotifications();
    setNotificationLoading(false);
  };

  const handleBookmarkAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

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

          <div className="flex items-center gap-3">
            {/* Notification Status */}
            {notificationsSupported && !notificationsEnabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnableNotifications}
                disabled={notificationLoading}
                className="gap-1"
              >
                <BellIcon className="size-4" />
                {notificationLoading ? "Enabling..." : "Enable Reminders"}
              </Button>
            )}
            {notificationsEnabled && (
              <Badge variant="success" className="gap-1">
                <BellIcon className="size-3" />
                Reminders On
              </Badge>
            )}

            {/* User Menu */}
            <div className="flex items-center gap-2 border-l-2 border-border pl-3">
              <Link href="/profile">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  title="Profile settings"
                >
                  <div className="size-6 rounded-base border-2 border-border bg-main flex items-center justify-center">
                    <UserIcon className="size-3 text-main-foreground" />
                  </div>
                  <span className="hidden sm:inline">
                    {user?.email?.split("@")[0]}
                  </span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleSignOut}
                title="Sign out"
              >
                <LogOutIcon className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Top Bar with Add Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-heading">Your Links</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Save links and get reminded to read them later.
            </p>
          </div>
          <AddBookmarkDialog onBookmarkAdded={handleBookmarkAdded} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "unread" ? "default" : "neutral"}
            onClick={() => setActiveTab("unread")}
          >
            Unread
          </Button>
          <Button
            variant={activeTab === "all" ? "default" : "neutral"}
            onClick={() => setActiveTab("all")}
          >
            All Links
          </Button>
        </div>

        {/* Bookmark List */}
        <BookmarkList filter={activeTab} refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
