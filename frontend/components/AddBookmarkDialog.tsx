"use client";

import { LinkIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/app/components/AuthProvider";
import {
  addBookmark,
  type ReminderInterval,
} from "@/app/lib/firebase/bookmarks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddBookmarkDialogProps {
  onBookmarkAdded?: () => void;
}

export function AddBookmarkDialog({ onBookmarkAdded }: AddBookmarkDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [reminderInterval, setReminderInterval] =
    useState<ReminderInterval>("1d");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to add bookmarks");
      return;
    }

    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    // Basic URL validation
    let validUrl = url.trim();
    if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
      validUrl = "https://" + validUrl;
    }

    try {
      new URL(validUrl);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First add the bookmark with just the URL
      await addBookmark(user.uid, {
        url: validUrl,
        reminderInterval,
      });

      // Reset form and close dialog
      setUrl("");
      setReminderInterval("1d");
      setOpen(false);
      onBookmarkAdded?.();
    } catch (err) {
      console.error("Error adding bookmark:", err);
      setError("Failed to add bookmark. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <LinkIcon className="size-4" />
          Add Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Save a Link</DialogTitle>
            <DialogDescription>
              Paste a URL and we&apos;ll remind you to check it out later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="text"
                placeholder="https://example.com/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reminder">Remind me in</Label>
              <Select
                value={reminderInterval}
                onValueChange={(value) =>
                  setReminderInterval(value as ReminderInterval)
                }
                disabled={isLoading}
              >
                <SelectTrigger id="reminder">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">1 day</SelectItem>
                  <SelectItem value="3d">3 days</SelectItem>
                  <SelectItem value="1w">1 week</SelectItem>
                  <SelectItem value="1m">1 month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Link"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
