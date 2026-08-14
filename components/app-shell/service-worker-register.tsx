"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Offline fallback is a nice-to-have — a failed registration
        // (unsupported browser, blocked by an extension) shouldn't be
        // treated as an app error.
      });
    }
  }, []);

  return null;
}
