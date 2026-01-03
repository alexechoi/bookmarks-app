This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Configure Firebase

Copy the environment example file and fill in your Firebase configuration:

```bash
cp .env.example .env.local
```

Get your Firebase config values from the [Firebase Console](https://console.firebase.google.com/) -> Project Settings -> General -> Your apps -> Web app.

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Firebase Authentication

This app includes Firebase Authentication with:

- Email/password sign-in
- Google sign-in
- Apple sign-in

### Routes

- `/auth/login` - Sign in page
- `/auth/signup` - Sign up page
- `/dashboard` - Protected dashboard (requires authentication)

## Data Model

### User Data

When a user signs up, a Firestore document is created at `/users/{uid}` containing user profile data and consent timestamps.

### Bookmarks

Bookmarks are stored as subcollections under each user document for better security and data isolation:

```
/users/{userId}/bookmarks/{bookmarkId}
```

Each bookmark document contains:

- `url` - The saved URL
- `title` - Page title (auto-fetched)
- `description` - Page description (auto-fetched)
- `favicon` - Favicon URL (auto-fetched)
- `reminderInterval` - Reminder frequency: "1d", "3d", "1w", or "1m"
- `nextReminderAt` - When the next reminder is due
- `isRead` - Whether the bookmark has been read
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Firestore Security Rules

Configure your Firestore security rules to allow users to read/write only their own bookmarks:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Users can read/write their own bookmarks subcollection
      match /bookmarks/{bookmarkId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
