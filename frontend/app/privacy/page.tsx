import { BookmarkIcon, ShieldIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-border bg-secondary-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-8 rounded-base border-2 border-border bg-main flex items-center justify-center">
              <BookmarkIcon className="size-4 text-main-foreground" />
            </div>
            <span className="text-xl font-heading">LinkMind</span>
          </Link>
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

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-base border-2 border-border bg-chart-4 px-4 py-1.5 text-sm font-medium text-main-foreground mb-6">
            <ShieldIcon className="size-4" />
            Your privacy matters
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading">Privacy Policy</h1>
          <p className="mt-4 text-muted-foreground">
            Last updated: January 8, 2026
          </p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-heading mb-4">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to LinkMind. We respect your privacy and are committed
                to protecting your personal data. This privacy policy explains
                how we collect, use, and safeguard your information when you use
                our bookmark reminder service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading mb-4">
                Information We Collect
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>We collect the following types of information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong className="text-foreground">
                      Account Information:
                    </strong>{" "}
                    Email address and password when you create an account.
                  </li>
                  <li>
                    <strong className="text-foreground">Bookmark Data:</strong>{" "}
                    URLs you save, along with automatically fetched metadata
                    (titles, descriptions, favicons).
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Reminder Preferences:
                    </strong>{" "}
                    Your chosen reminder intervals and notification settings.
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Device Information:
                    </strong>{" "}
                    Push notification tokens for sending reminders to your
                    devices.
                  </li>
                  <li>
                    <strong className="text-foreground">Usage Data:</strong>{" "}
                    Information about how you interact with our service to
                    improve user experience.
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-heading mb-4">
                How We Use Your Information
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>We use your information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and maintain the LinkMind service</li>
                  <li>Send you bookmark reminders at your requested times</li>
                  <li>Authenticate your account and ensure security</li>
                  <li>Improve and personalize your experience</li>
                  <li>
                    Communicate with you about service updates and changes
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-heading mb-4">
                Data Storage & Security
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Your data is stored securely using Google Firebase services. We
                implement industry-standard security measures including
                encryption in transit and at rest. We never sell your personal
                data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading mb-4">
                Third-Party Services
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>We use the following third-party services:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong className="text-foreground">Firebase:</strong>{" "}
                    Authentication, database, and push notifications
                  </li>
                  <li>
                    <strong className="text-foreground">
                      Metadata Services:
                    </strong>{" "}
                    To fetch link previews and information
                  </li>
                </ul>
                <p>
                  These services have their own privacy policies governing the
                  use of your information.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-heading mb-4">Your Rights</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access and export your bookmark data</li>
                  <li>Update or correct your account information</li>
                  <li>Delete your account and all associated data</li>
                  <li>Opt out of non-essential communications</li>
                  <li>Disable push notifications at any time</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-heading mb-4">Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use essential cookies to maintain your session and
                preferences. We do not use tracking cookies or third-party
                advertising cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading mb-4">
                Changes to This Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this privacy policy from time to time. We will
                notify you of any significant changes by posting the new policy
                on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading mb-4">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this privacy policy or our data
                practices, please contact us at{" "}
                <a
                  href="mailto:privacy@linkmind.app"
                  className="text-main font-medium underline underline-offset-4"
                >
                  privacy@linkmind.app
                </a>
              </p>
            </section>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link
            href="/terms"
            className="text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            View Terms of Service →
          </Link>
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
