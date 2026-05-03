"use client";

import { useEffect } from "react";

const PING_KEY = "cbk:visit-pinged";

// Fires once per browser session: silently asks the server to log a daily visit
// for the currently signed-in subscriber. Server is the source of truth — if no
// cookie, it 204s and nothing happens.
export default function VisitPing() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(PING_KEY) === "1") return;
    sessionStorage.setItem(PING_KEY, "1");
    fetch("/api/visit", { method: "POST", cache: "no-store" }).catch(() => {});
  }, []);
  return null;
}
