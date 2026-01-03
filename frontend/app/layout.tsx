import "./globals.css";

import type { Metadata } from "next";
import { DM_Sans, Lexend } from "next/font/google";

import { AuthProvider } from "./components/AuthProvider";
import { PushNotificationProvider } from "./components/PushNotificationProvider";

const lexend = Lexend({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const dmSans = DM_Sans({
  variable: "--font-base",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LinkMind - Never Forget a Link Again",
  description:
    "Save interesting links and get smart reminders to actually read them.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lexend.variable} ${dmSans.variable} antialiased font-base`}
      >
        <AuthProvider>
          <PushNotificationProvider>{children}</PushNotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
