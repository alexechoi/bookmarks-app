import { BellIcon, BookmarkIcon, ClockIcon, LinkIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-border bg-secondary-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-base border-2 border-border bg-main flex items-center justify-center">
              <BookmarkIcon className="size-4 text-main-foreground" />
            </div>
            <span className="text-xl font-heading">LinkMind</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-5xl px-4 py-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-base border-2 border-border bg-main px-4 py-1.5 text-sm font-medium text-main-foreground mb-6">
            <BellIcon className="size-4" />
            Never forget an interesting link again
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading leading-tight">
            Save links.
            <br />
            <span className="text-main">Get reminded.</span>
            <br />
            Actually read them.
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            We all save links we never read. LinkMind sends you smart reminders
            so those interesting articles, videos, and resources don&apos;t get
            lost in your bookmarks.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="text-base">
                <LinkIcon className="size-5" />
                Start Saving Links
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="neutral" className="text-base">
                I have an account
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid gap-6 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="size-12 rounded-base border-2 border-border bg-chart-1 flex items-center justify-center mb-4">
                <LinkIcon className="size-6 text-main-foreground" />
              </div>
              <h3 className="font-heading text-lg">Paste & Save</h3>
              <p className="text-muted-foreground mt-2">
                Just paste a URL and we automatically fetch the title,
                description, and favicon. No extra work needed.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="size-12 rounded-base border-2 border-border bg-chart-2 flex items-center justify-center mb-4">
                <ClockIcon className="size-6 text-white" />
              </div>
              <h3 className="font-heading text-lg">Smart Reminders</h3>
              <p className="text-muted-foreground mt-2">
                Choose when to be reminded: 1 day, 3 days, 1 week, or 1 month.
                We&apos;ll ping you at the right time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="size-12 rounded-base border-2 border-border bg-chart-4 flex items-center justify-center mb-4">
                <BellIcon className="size-6 text-main-foreground" />
              </div>
              <h3 className="font-heading text-lg">Push Notifications</h3>
              <p className="text-muted-foreground mt-2">
                Get browser notifications for your saved links. Daily reminders
                help you stay on top of your reading list.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-heading">How it works</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center">
              <div className="size-16 rounded-base border-2 border-border bg-main flex items-center justify-center text-2xl font-heading text-main-foreground">
                1
              </div>
              <h3 className="font-heading text-lg mt-4">Save a link</h3>
              <p className="text-muted-foreground mt-2">
                Paste any URL and choose your reminder interval.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="size-16 rounded-base border-2 border-border bg-main flex items-center justify-center text-2xl font-heading text-main-foreground">
                2
              </div>
              <h3 className="font-heading text-lg mt-4">Get reminded</h3>
              <p className="text-muted-foreground mt-2">
                Receive a notification when it&apos;s time to read.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="size-16 rounded-base border-2 border-border bg-main flex items-center justify-center text-2xl font-heading text-main-foreground">
                3
              </div>
              <h3 className="font-heading text-lg mt-4">Actually read it</h3>
              <p className="text-muted-foreground mt-2">
                Mark as read or snooze for later. Stay in control.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <Card className="p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-heading">
              Ready to stop losing interesting links?
            </h2>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
              Join LinkMind and start building a reading habit. It&apos;s free
              to get started.
            </p>
            <div className="mt-6">
              <Link href="/auth/signup">
                <Button size="lg" className="text-base">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-border bg-secondary-background py-8 mt-24">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="size-6 rounded-base border-2 border-border bg-main flex items-center justify-center">
              <BookmarkIcon className="size-3 text-main-foreground" />
            </div>
            <span className="font-heading">LinkMind</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-2">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Save links. Get reminded. Actually read them.
          </p>
        </div>
      </footer>
    </div>
  );
}
