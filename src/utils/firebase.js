import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? ""
};

export const firebaseEnabled = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

function getFirebaseApp() {
  if (!firebaseEnabled) {
    throw new Error("Firebase sozlanmagan. .env faylga VITE_FIREBASE_* qiymatlarini yozing.");
  }

  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

function splitName(displayName) {
  const nameParts = String(displayName ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    firstName: nameParts[0] ?? "Google",
    lastName: nameParts.slice(1).join(" ") || "User"
  };
}

export async function signInWithGooglePopup() {
  const app = getFirebaseApp();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const result = await signInWithPopup(auth, provider);
  const firebaseUser = result.user;
  const { firstName, lastName } = splitName(firebaseUser.displayName);
  const idToken = await firebaseUser.getIdToken();

  return {
    idToken,
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? "",
    firstName,
    lastName,
    fullName: firebaseUser.displayName ?? `${firstName} ${lastName}`.trim(),
    photoURL: firebaseUser.photoURL ?? "",
    provider: "google"
  };
}

export async function logoutFirebaseSession() {
  if (!firebaseEnabled) {
    return;
  }

  const app = getFirebaseApp();
  await signOut(getAuth(app));
}
