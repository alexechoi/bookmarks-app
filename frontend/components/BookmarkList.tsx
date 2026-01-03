"use client";

import { BookmarkIcon, Loader2Icon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/app/components/AuthProvider";
import {
  type Bookmark,
  getBookmarks,
  getUnreadBookmarks,
} from "@/app/lib/firebase/bookmarks";
import { Button } from "@/components/ui/button";

import { BookmarkCard } from "./BookmarkCard";

interface BookmarkListProps {
  filter: "all" | "unread";
  refreshTrigger?: number;
}

export function BookmarkList({ filter, refreshTrigger }: BookmarkListProps) {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data =
        filter === "unread"
          ? await getUnreadBookmarks(user.uid)
          : await getBookmarks(user.uid);
      setBookmarks(data);
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
      setError("Failed to load bookmarks");
    } finally {
      setIsLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks, refreshTrigger]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-destructive font-medium">{error}</p>
        <Button variant="outline" onClick={fetchBookmarks}>
          Try Again
        </Button>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <div className="size-16 rounded-base border-2 border-border bg-main flex items-center justify-center">
          <BookmarkIcon className="size-8 text-main-foreground" />
        </div>
        <div>
          <h3 className="font-heading text-lg">
            {filter === "unread" ? "All caught up!" : "No bookmarks yet"}
          </h3>
          <p className="text-muted-foreground mt-1">
            {filter === "unread"
              ? "You've read all your saved links. Nice work!"
              : "Add your first link to get started."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark.id}
          userId={user!.uid}
          bookmark={bookmark}
          onUpdate={fetchBookmarks}
        />
      ))}
    </div>
  );
}
