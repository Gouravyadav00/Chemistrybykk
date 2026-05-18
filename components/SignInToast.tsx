"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const SHOWN_KEY = "cbk:signin-toast-shown";
const APPEAR_DELAY = 1400; // ms before it slides in
const AUTO_HIDE = 5000; // ms visible before auto-dismiss

export default function SignInToast() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SHOWN_KEY) === "1") return;

    let timer = 0;
    let cancelled = false;

    // Skip the toast for anyone already signed in (admin or student).
    fetch("/api/auth", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d?.role === "admin" || d?.role === "subscriber") {
          sessionStorage.setItem(SHOWN_KEY, "1");
          return;
        }
        timer = window.setTimeout(() => {
          if (cancelled) return;
          setOpen(true);
          sessionStorage.setItem(SHOWN_KEY, "1");
        }, APPEAR_DELAY);
      })
      .catch(() => {
        // If the auth check fails, fall back to the original behavior so
        // guests still get the prompt.
        timer = window.setTimeout(() => {
          if (cancelled) return;
          setOpen(true);
          sessionStorage.setItem(SHOWN_KEY, "1");
        }, APPEAR_DELAY);
      });

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => setOpen(false), AUTO_HIDE);
    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -10, x: 30 }}
          transition={{ type: "spring", damping: 22, stiffness: 220 }}
          className="fixed top-20 right-3 sm:right-6 z-50 w-[88vw] max-w-sm"
          role="status"
          aria-live="polite"
        >
          <div className="clay glass p-3 sm:p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-300 to-blue-600 grid place-items-center text-white shadow-clay-sm flex-shrink-0">
              <Bell size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="display font-bold text-sm text-clay-ink dark:text-white">
                Sign in for updates
              </div>
              <p className="text-[12px] text-clay-muted mt-0.5 leading-snug">
                Get notified when new notes, cheatsheets and videos drop.
              </p>
              <div className="mt-2 flex gap-2">
                <Link
                  href="/signin"
                  onClick={() => setOpen(false)}
                  className="text-[12px] font-bold text-clay-accent hover:text-clay-accentDeep"
                >
                  Sign in →
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="text-[12px] text-clay-muted hover:text-clay-ink dark:hover:text-white"
                >
                  Not now
                </button>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Dismiss"
              className="clay-sm w-7 h-7 grid place-items-center text-clay-muted hover:text-clay-ink dark:hover:text-white flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
