"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import Logo from "./Logo";

type Role = "admin" | "subscriber" | "guest";

export default function Footer() {
  const [role, setRole] = useState<Role>("guest");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setRole((d?.role as Role) ?? "guest");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const signedIn = role === "admin" || role === "subscriber";

  return (
    <footer className="mt-24 pb-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto clay px-6 sm:px-10 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <div className="mb-4">
            <Logo size="lg" />
          </div>
          <p className="text-sm text-clay-muted">
            Chemistry simplified for every student — Class 9 through 12.
            Built with love by Khyati Kaushik.
          </p>
        </div>

        <div>
          <h4 className="display font-bold text-clay-ink dark:text-white mb-3">
            Explore
          </h4>
          <ul className="space-y-2 text-sm text-clay-muted">
            <li><a href="#home" className="hover:text-clay-accent">Home</a></li>
            <li><a href="#about" className="hover:text-clay-accent">About</a></li>
            <li><a href="#learn" className="hover:text-clay-accent">Learning Hub</a></li>
            <li><Link href="/doubts" className="hover:text-clay-accent">Doubts</Link></li>
            <li><a href="#connect" className="hover:text-clay-accent">Connect</a></li>
            <li><Link href="/share" className="hover:text-clay-accent">Share Banner</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="display font-bold text-clay-ink dark:text-white mb-3">
            Stay Updated
          </h4>
          <ul className="space-y-2 text-sm text-clay-muted">
            <li>
              {signedIn ? (
                <span
                  aria-disabled="true"
                  className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 cursor-default select-none"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Signed In
                </span>
              ) : (
                <Link href="/signin" className="hover:text-clay-accent">Sign In</Link>
              )}
            </li>
            <li>Notification on new notes</li>
            <li>Cheatsheets &amp; video alerts</li>
          </ul>
        </div>
      </div>

      <p className="text-center text-xs text-clay-muted mt-6 flex items-center justify-center gap-1">
        © {new Date().getFullYear()} ChemistryByKK. Made with
        <Heart size={12} className="text-blue-500 inline" /> for curious minds.
      </p>
    </footer>
  );
}
