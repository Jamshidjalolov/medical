import { useEffect, useState } from "react";
import { localizeText } from "../utils/locale";
import { firebaseEnabled } from "../utils/firebase";
import SkeletonBlock from "./SkeletonBlock";

const googleIcon = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M21.35 11.1H12v2.98h5.36c-.23 1.5-1.86 4.4-5.36 4.4-3.23 0-5.87-2.67-5.87-5.96s2.64-5.96 5.87-5.96c1.84 0 3.07.78 3.78 1.46l2.58-2.5C16.72 3.97 14.58 3 12 3 6.93 3 2.82 7.15 2.82 12.26S6.93 21.52 12 21.52c6.02 0 8.99-4.23 8.99-10.18 0-.68-.07-1.18-.16-1.67Z"
    />
    <path
      fill="#34A853"
      d="M12 21.52c2.58 0 4.74-.85 6.32-2.3l-3.01-2.35c-.81.57-1.85.97-3.31.97-3.5 0-5.13-2.9-5.36-4.4H3.18v2.77A9.55 9.55 0 0 0 12 21.52Z"
    />
    <path
      fill="#FBBC05"
      d="M6.64 13.44A5.98 5.98 0 0 1 6.33 12c0-.5.11-.98.31-1.44V7.79H3.18A9.62 9.62 0 0 0 2.82 12c0 1.55.37 3.01 1.02 4.21l2.8-2.18 0-.59Z"
    />
    <path
      fill="#EA4335"
      d="M12 6.55c1.99 0 3.34.87 4.1 1.59l2.99-2.92C16.73 3.08 14.58 3 12 3a9.55 9.55 0 0 0-8.82 5.79l3.46 2.77c.84-2.53 3.18-5.01 5.36-5.01Z"
    />
  </svg>
);

export default function GoogleAuthButton({ language, loading, onClick }) {
  const [isReady, setIsReady] = useState(false);
  const tx = (value) => localizeText(value, language);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsReady(true), 250);
    return () => window.clearTimeout(timer);
  }, []);

  if (!isReady) {
    return <SkeletonBlock className="h-14 w-full rounded-2xl" />;
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={loading || !firebaseEnabled}
        onClick={onClick}
        className={`secondary-button w-full gap-3 ${loading || !firebaseEnabled ? "cursor-not-allowed opacity-70" : ""}`}
      >
        {googleIcon}
        <span>{loading ? tx("Google tekshirilmoqda...") : tx("Google orqali kirish")}</span>
      </button>

      {!firebaseEnabled ? (
        <p className="text-center text-xs leading-6 text-amber-600">
          {tx("Firebase sozlamalari kiritilmaguncha Google kirish ishlamaydi.")}
        </p>
      ) : null}
    </div>
  );
}
