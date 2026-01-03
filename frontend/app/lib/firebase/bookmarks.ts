/**
 * Bookmark management functions for Firestore
 *
 * Handles CRUD operations for user bookmarks with reminder functionality.
 * Bookmarks are stored as subcollections under /users/{userId}/bookmarks/
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./config";

export type ReminderInterval = "1d" | "3d" | "1w" | "1m";

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  favicon: string;
  reminderInterval: ReminderInterval;
  nextReminderAt: Timestamp;
  isRead: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateBookmarkInput {
  url: string;
  title?: string;
  description?: string;
  favicon?: string;
  reminderInterval: ReminderInterval;
}

/**
 * Get the bookmarks subcollection reference for a user
 */
function getBookmarksCollection(userId: string) {
  return collection(db, "users", userId, "bookmarks");
}

/**
 * Get a bookmark document reference
 */
function getBookmarkDoc(userId: string, bookmarkId: string) {
  return doc(db, "users", userId, "bookmarks", bookmarkId);
}

/**
 * Calculate the next reminder date based on the interval
 */
export function calculateNextReminder(interval: ReminderInterval): Date {
  const now = new Date();
  switch (interval) {
    case "1d":
      return new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    case "3d":
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    case "1w":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "1m":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  }
}

/**
 * Get friendly label for reminder interval
 */
export function getReminderLabel(interval: ReminderInterval): string {
  switch (interval) {
    case "1d":
      return "1 day";
    case "3d":
      return "3 days";
    case "1w":
      return "1 week";
    case "1m":
      return "1 month";
    default:
      return interval;
  }
}

/**
 * Add a new bookmark for a user
 * Stored at: /users/{userId}/bookmarks/{bookmarkId}
 */
export async function addBookmark(
  userId: string,
  input: CreateBookmarkInput,
): Promise<string> {
  const nextReminderAt = Timestamp.fromDate(
    calculateNextReminder(input.reminderInterval),
  );

  const bookmarkData = {
    url: input.url,
    title: input.title || input.url,
    description: input.description || "",
    favicon: input.favicon || "",
    reminderInterval: input.reminderInterval,
    nextReminderAt,
    isRead: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(getBookmarksCollection(userId), bookmarkData);
  return docRef.id;
}

/**
 * Get all bookmarks for a user
 */
export async function getBookmarks(userId: string): Promise<Bookmark[]> {
  const q = query(getBookmarksCollection(userId), orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Bookmark[];
}

/**
 * Get unread bookmarks for a user
 */
export async function getUnreadBookmarks(userId: string): Promise<Bookmark[]> {
  const q = query(
    getBookmarksCollection(userId),
    where("isRead", "==", false),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Bookmark[];
}

/**
 * Mark a bookmark as read
 */
export async function markBookmarkAsRead(
  userId: string,
  bookmarkId: string,
): Promise<void> {
  const docRef = getBookmarkDoc(userId, bookmarkId);
  await updateDoc(docRef, {
    isRead: true,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Mark a bookmark as unread and reschedule reminder
 */
export async function markBookmarkAsUnread(
  userId: string,
  bookmarkId: string,
  reminderInterval: ReminderInterval,
): Promise<void> {
  const nextReminderAt = Timestamp.fromDate(
    calculateNextReminder(reminderInterval),
  );

  const docRef = getBookmarkDoc(userId, bookmarkId);
  await updateDoc(docRef, {
    isRead: false,
    nextReminderAt,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update bookmark reminder interval
 */
export async function updateBookmarkReminder(
  userId: string,
  bookmarkId: string,
  reminderInterval: ReminderInterval,
): Promise<void> {
  const nextReminderAt = Timestamp.fromDate(
    calculateNextReminder(reminderInterval),
  );

  const docRef = getBookmarkDoc(userId, bookmarkId);
  await updateDoc(docRef, {
    reminderInterval,
    nextReminderAt,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a bookmark
 */
export async function deleteBookmark(
  userId: string,
  bookmarkId: string,
): Promise<void> {
  const docRef = getBookmarkDoc(userId, bookmarkId);
  await deleteDoc(docRef);
}

/**
 * Update bookmark metadata (title, description, favicon)
 */
export async function updateBookmarkMetadata(
  userId: string,
  bookmarkId: string,
  metadata: {
    title?: string;
    description?: string;
    favicon?: string;
  },
): Promise<void> {
  const docRef = getBookmarkDoc(userId, bookmarkId);
  await updateDoc(docRef, {
    ...metadata,
    updatedAt: serverTimestamp(),
  });
}
