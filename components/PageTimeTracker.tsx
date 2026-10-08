"use client";

import { useEffect } from "react";

export default function PageTimeTracker() {
  useEffect(() => {
    const started = Date.now();

    function recordTime() {
      const seconds = Math.max(
        1,
        Math.round((Date.now() - started) / 1000)
      );

      const data = JSON.stringify({
        event_type: "page_view",
        activity_type: "dashboard",
        duration_seconds: seconds
      });

      navigator.sendBeacon(
        "/api/metrics",
        new Blob([data], { type: "application/json" })
      );
    }

    window.addEventListener("pagehide", recordTime);

    return () => {
      window.removeEventListener("pagehide", recordTime);
    };
  }, []);

  return null;
}
