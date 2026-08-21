"use client";

import { useEffect } from "react";

const COOKIE_NAME = "farata_ref";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

// Stashes a ?ref= code from the signup URL into a cookie, read later in
// saveBasicInfoAction once the profile row actually gets created (email
// signup and Google OAuth both land there, so capturing here on page load
// — before either path is chosen — covers both). Reads window.location
// directly instead of useSearchParams() so this never needs a Suspense
// boundary on an otherwise static page.
export function ReferralCapture() {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) {
      document.cookie = `${COOKIE_NAME}=${encodeURIComponent(ref)}; path=/; max-age=${MAX_AGE_SECONDS}`;
    }
  }, []);

  return null;
}
