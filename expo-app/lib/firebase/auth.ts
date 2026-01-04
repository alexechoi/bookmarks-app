import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword as firebaseUpdatePassword,
} from "@react-native-firebase/auth";

import { auth } from "./config";

/**
 * Sign up a new user with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<FirebaseAuthTypes.UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Sign in an existing user with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<FirebaseAuthTypes.UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign in with Google
 *
 * Note: This requires @react-native-google-signin/google-signin to be installed
 * and configured. For now, we'll create the structure and you can enable it
 * once the package is installed.
 */
export async function signInWithGoogle(): Promise<FirebaseAuthTypes.UserCredential> {
  // Import dynamically to avoid errors if the package isn't installed yet
  try {
    const { GoogleSignin } =
      await import("@react-native-google-signin/google-signin");

    // Configure Google Sign-In
    GoogleSignin.configure({
      // Get webClientId from google-services.json or GoogleService-Info.plist
      scopes: ["email", "profile"],
    });

    // Check if device supports Google Play Services
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Get the user's ID token
    const signInResult = await GoogleSignin.signIn();

    // Get the ID token
    const idToken = signInResult.data?.idToken;
    if (!idToken) {
      throw new Error("No ID token found");
    }

    // Create a Google credential with the token
    const googleCredential = GoogleAuthProvider.credential(idToken);

    // Sign in to Firebase with the credential
    return signInWithCredential(auth, googleCredential);
  } catch (error) {
    console.error("Google Sign-In error:", error);
    throw error;
  }
}

/**
 * Sign in with Apple
 *
 * Note: This requires @invertase/react-native-apple-authentication to be installed.
 * For now, we'll create the structure and you can enable it once the package is installed.
 */
export async function signInWithApple(): Promise<FirebaseAuthTypes.UserCredential> {
  try {
    const { appleAuth } =
      await import("@invertase/react-native-apple-authentication");

    // Start the sign-in request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    // Ensure Apple returned a user identityToken
    if (!appleAuthRequestResponse.identityToken) {
      throw new Error("Apple Sign-In failed - no identity token returned");
    }

    // Create an Apple credential
    const { identityToken, nonce } = appleAuthRequestResponse;
    const appleCredential = OAuthProvider.credential(
      "apple.com",
      identityToken,
      nonce
    );

    // Sign in to Firebase with the credential
    return signInWithCredential(auth, appleCredential);
  } catch (error) {
    console.error("Apple Sign-In error:", error);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  // Also sign out from Google if signed in
  try {
    const { GoogleSignin } =
      await import("@react-native-google-signin/google-signin");
    // Try to sign out - will fail silently if not signed in with Google
    await GoogleSignin.signOut();
  } catch {
    // Google Sign-In not available or not signed in, ignore
  }

  return firebaseSignOut(auth);
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser(): FirebaseAuthTypes.User | null {
  return auth.currentUser;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChanged(
  callback: (user: FirebaseAuthTypes.User | null) => void
): () => void {
  return firebaseOnAuthStateChanged(auth, callback);
}

/**
 * Send a password reset email to the user
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  return firebaseSendPasswordResetEmail(auth, email);
}

/**
 * Update the current user's password
 * Requires re-authentication with current password
 */
export async function updatePassword(
  currentPassword: string,
  newPassword: string
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

/**
 * Get the authentication provider used by the current user
 */
export function getAuthProvider(): string | null {
  const user = auth.currentUser;
  if (!user) return null;

  // Check provider data to determine how user signed in
  const providers = user.providerData;
  if (providers.length === 0) return null;

  const providerId = providers[0].providerId;
  if (providerId === "google.com") return "google";
  if (providerId === "apple.com") return "apple";
  if (providerId === "password") return "password";

  return providerId;
}
