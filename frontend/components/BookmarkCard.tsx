"use client";

import {
  CheckCircleIcon,
  ClockIcon,
  ExternalLinkIcon,
  GlobeIcon,
  Loader2Icon,
  RotateCcwIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";

import {
  type Bookmark,
  deleteBookmark,
  getReminderLabel,
  markBookmarkAsRead,
  markBookmarkAsUnread,
} from "@/app/lib/firebase/bookmarks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface BookmarkCardProps {
  userId: string;
  bookmark: Bookmark;
  onUpdate?: () => void;
}

export function BookmarkCard({
  userId,
  bookmark,
  onUpdate,
}: BookmarkCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState<
    "read" | "unread" | "delete" | null
  >(null);

  const handleMarkAsRead = async () => {
    setIsLoading(true);
    setActionType("read");
    try {
      await markBookmarkAsRead(userId, bookmark.id);
      onUpdate?.();
    } catch (error) {
      console.error("Error marking as read:", error);
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  const handleMarkAsUnread = async () => {
    setIsLoading(true);
    setActionType("unread");
    try {
      await markBookmarkAsUnread(
        userId,
        bookmark.id,
        bookmark.reminderInterval,
      );
      onUpdate?.();
    } catch (error) {
      console.error("Error marking as unread:", error);
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this bookmark?")) {
      return;
    }

    setIsLoading(true);
    setActionType("delete");
    try {
      await deleteBookmark(userId, bookmark.id);
      onUpdate?.();
    } catch (error) {
      console.error("Error deleting bookmark:", error);
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  const domain = (() => {
    try {
      return new URL(bookmark.url).hostname.replace("www.", "");
    } catch {
      return bookmark.url;
    }
  })();

  const formattedDate = (() => {
    try {
      return bookmark.createdAt.toDate().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  })();

  const nextReminderDate = (() => {
    try {
      return bookmark.nextReminderAt.toDate().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  })();

  return (
    <Card className={`transition-all ${bookmark.isRead ? "opacity-60" : ""}`}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Favicon */}
          <div className="flex-shrink-0">
            {bookmark.favicon ? (
              <img
                src={bookmark.favicon}
                alt=""
                className="size-10 rounded-base border-2 border-border"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden",
                  );
                }}
              />
            ) : null}
            <div
              className={`size-10 rounded-base border-2 border-border bg-main flex items-center justify-center ${bookmark.favicon ? "hidden" : ""}`}
            >
              <GlobeIcon className="size-5 text-main-foreground" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-heading text-base truncate">
                  {bookmark.title || domain}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {domain}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Badge variant={bookmark.isRead ? "secondary" : "default"}>
                  {bookmark.isRead ? "Read" : "Unread"}
                </Badge>
              </div>
            </div>

            {bookmark.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {bookmark.description}
              </p>
            )}

            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span>Added {formattedDate}</span>
              {!bookmark.isRead && (
                <span className="flex items-center gap-1">
                  <ClockIcon className="size-3" />
                  Reminder: {nextReminderDate} (
                  {getReminderLabel(bookmark.reminderInterval)})
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3">
              <Button variant="outline" size="sm" asChild className="gap-1">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleMarkAsRead}
                >
                  <ExternalLinkIcon className="size-3" />
                  Open
                </a>
              </Button>

              {bookmark.isRead ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAsUnread}
                  disabled={isLoading}
                  className="gap-1"
                >
                  {isLoading && actionType === "unread" ? (
                    <Loader2Icon className="size-3 animate-spin" />
                  ) : (
                    <RotateCcwIcon className="size-3" />
                  )}
                  Remind Again
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAsRead}
                  disabled={isLoading}
                  className="gap-1"
                >
                  {isLoading && actionType === "read" ? (
                    <Loader2Icon className="size-3 animate-spin" />
                  ) : (
                    <CheckCircleIcon className="size-3" />
                  )}
                  Mark Read
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
                className="gap-1 text-destructive hover:text-destructive"
              >
                {isLoading && actionType === "delete" ? (
                  <Loader2Icon className="size-3 animate-spin" />
                ) : (
                  <TrashIcon className="size-3" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
