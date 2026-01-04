import type { UserCredential } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updatePassword as firebaseUpdatePassword,
} from "firebase/auth";

import { auth } from "./config";

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  acceptedMarketing: boolean;
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  provider.addScope("email");
  provider.addScope("profile");
  return signInWithPopup(auth, provider);
}

export async function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}

export function getCurrentUser() {
  return auth.currentUser;
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  return firebaseSendPasswordResetEmail(auth, email);
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("No authenticated user found");
  }

  // Re-authenticate user before password change
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);

  // Update password
  await firebaseUpdatePassword(user, newPassword);
}

export function getAuthProvider(): string | null {
  const user = auth.currentUser;
  if (!user) return null;

  // Check provider data to determine how user signed in
  const providers = user.providerData;
  if (providers.length === 0) return null;

  const providerId = providers[0].providerId;
  if (providerId === "google.com") return "google";
  if (providerId === "password") return "password";

  return providerId;
}
