import { BookmarkIcon, ScrollTextIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsOfService() {
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
          <div className="inline-flex items-center gap-2 rounded-base border-2 border-border bg-chart-2 px-4 py-1.5 text-sm font-medium text-white mb-6">
            <ScrollTextIcon className="size-4" />
            Terms & Conditions
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading">
            Terms of Service
          </h1>
          <p className="mt-4 text-muted-foreground">
            Last updated: January 8, 2026
          </p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-heading mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using LinkMind, you agree to be bound by these
                Terms of Service. If you do not agree to these terms, please do
                not use our service. We reserve the right to update these terms
                at any time, and your continued use of the service constitutes
                acceptance of any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading mb-4">
                2. Description of Service
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                LinkMind is a bookmark management service that allows you to
                save URLs and receive reminders to read them. We automatically
                fetch metadata for saved links and send push notifications based
                on your preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading mb-4">3. User Accounts</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>When creating an account, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>
                    Accept responsibility for all activities under your account
                  </li>
                  <li>Notify us immediately of any unauthorized access</li>
                </ul>
                <p>
                  You must be at least 13 years old to use LinkMind. If you are
                  under 18, you must have parental consent.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-heading mb-4">4. Acceptable Use</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>You agree not to use LinkMind to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Save or share links to illegal, harmful, or offensive
                    content
                  </li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights of others</li>
                  <li>
                    Attempt to gain unauthorized access to our systems or other
                    users&apos; accounts
                  </li>
                  <li>
                    Use automated systems or bots to access the service without
                    permission
                  </li>
                  <li>Interfere with the proper functioning of the service</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-heading mb-4">5. User Content</h2>
              <p className="text-muted-foreground leading-relaxed">
                You retain ownership of the bookmarks and data you save to
                LinkMind. By using our service, you grant us a limited license
                to store, process, and display your content solely for the
                purpose of providing the service to you. We do not claim
                ownership of your content and will not use it for any other
                purpose.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading mb-4">
                6. Intellectual Property
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The LinkMind service, including its design, features, and code,
                is owned by us and protected by intellectual property laws. You
                may not copy, modify, distribute, or reverse engineer any part
                of our service without explicit permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading mb-4">
                7. Service Availability
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We strive to maintain high availability but do not guarantee
                uninterrupted access to LinkMind. We may temporarily suspend the
                service for maintenance, updates, or other reasons. We are not
                liable for any losses resulting from service interruptions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading mb-4">
                8. Limitation of Liability
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                LinkMind is provided &quot;as is&quot; without warranties of any
                kind. To the maximum extent permitted by law, we shall not be
                liable for any indirect, incidental, special, or consequential
                damages arising from your use of the service. Our total
                liability shall not exceed the amount you paid us in the
                preceding 12 months.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading mb-4">9. Termination</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  You may delete your account at any time through your profile
                  settings. We may suspend or terminate your account if you
                  violate these terms or engage in harmful behavior.
                </p>
                <p>
                  Upon termination, your right to use the service will
                  immediately cease. We may retain certain data as required by
                  law or for legitimate business purposes.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-heading mb-4">10. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms shall be governed by and construed in accordance
                with applicable laws, without regard to conflict of law
                principles. Any disputes arising from these terms or your use of
                LinkMind shall be resolved through binding arbitration.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading mb-4">
                11. Changes to Terms
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. We will
                notify users of significant changes via email or through the
                service. Your continued use of LinkMind after changes are posted
                constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading mb-4">12. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about these Terms of Service, please
                contact us at{" "}
                <a
                  href="mailto:legal@linkmind.app"
                  className="text-main font-medium underline underline-offset-4"
                >
                  legal@linkmind.app
                </a>
              </p>
            </section>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link
            href="/privacy"
            className="text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            View Privacy Policy →
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
