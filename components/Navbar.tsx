"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Flame,
  LayoutDashboard,
  Menu,
  MessageCircleQuestion,
  UserCircle2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

type Whoami =
  | { role: "guest" }
  | {
      role: "subscriber";
      subscriber: { email: string; name?: string; class?: string };
      streak?: number;
    }
  | { role: "admin" };

const links = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#learn", label: "Learning Hub" },
  { href: "#videos", label: "Videos" },
  { href: "/quiz", label: "Quizzes" },
  { href: "#connect", label: "Connect" },
];

const firstName = (full?: string) => {
  if (!full) return undefined;
  return full.trim().split(/\s+/)[0];
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<Whoami | null>(null);
  const [doubtUnread, setDoubtUnread] = useState(0);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 60], [0, -2]);

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe({ role: "guest" }));
  }, []);

  useEffect(() => {
    if (!me || me.role === "guest") return;
    const load = () =>
      fetch("/api/doubts/unread")
        .then((r) => r.json())
        .then((d) => setDoubtUnread(d.unread ?? 0))
        .catch(() => {});
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [me]);

  const isSubscriber = !!me && me.role === "subscriber";
  const showDoubts = !!me && me.role !== "admin";
  const streak = isSubscriber && me.role === "subscriber" ? me.streak ?? 0 : null;

  const greet = (() => {
    if (!me || me.role === "guest") return null;
    if (me.role === "admin") {
      return { label: "Khyati", icon: <LayoutDashboard size={14} /> };
    }
    const name =
      firstName(me.subscriber.name) ??
      me.subscriber.email.split("@")[0];
    return { label: name, icon: <UserCircle2 size={14} /> };
  })();

  return (
    <motion.header
      style={{ y }}
      className="sticky top-2 sm:top-3 z-40 mx-auto max-w-6xl px-3 sm:px-6"
    >
      <div className="glass clay-sm flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-3 rounded-2xl">
        <Link
          href="#home"
          className="flex items-center min-w-0"
          aria-label="ChemistryByKK · Home"
        >
          <Logo size="md" priority />
          <span className="sr-only">ChemistryByKK</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-2 rounded-xl text-sm font-medium text-clay-muted hover:text-clay-accent hover:bg-white/60 dark:hover:bg-white/5 transition"
            >
              {l.label}
            </a>
          ))}
          {showDoubts && (
            <Link
              href="/doubts"
              className="px-3 py-2 rounded-xl text-sm font-semibold text-clay-accent hover:text-clay-accentDeep hover:bg-blue-50 dark:hover:bg-white/5 transition flex items-center gap-1.5 relative"
            >
              <MessageCircleQuestion size={14} />
              Doubts
              {doubtUnread > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-clay-accent text-white min-w-[18px] text-center">
                  {doubtUnread > 9 ? "9+" : doubtUnread}
                </span>
              )}
            </Link>
          )}
          {greet ? (
            <Link
              href="/signin"
              className="ml-1 px-3 py-2 rounded-xl text-sm font-semibold text-clay-accent flex items-center gap-1.5 max-w-[10rem] truncate"
              title={`Signed in as ${greet.label}`}
            >
              {greet.icon}
              <span className="truncate">Hi, {greet.label}</span>
            </Link>
          ) : (
            <Link
              href="/signin"
              className="ml-1 px-3 py-2 rounded-xl text-sm font-semibold text-clay-accent"
            >
              Sign In
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {streak !== null && <StreakPill streak={streak} compact />}
          <ThemeToggle />
          <button
            className="md:hidden clay-sm w-11 h-11 flex items-center justify-center"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mt-2 clay p-3 flex flex-col"
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-3 py-3 rounded-xl text-clay-ink dark:text-white hover:bg-clay-soft/50"
            >
              {l.label}
            </a>
          ))}
          {showDoubts && (
            <Link
              href="/doubts"
              onClick={() => setOpen(false)}
              className="px-3 py-3 rounded-xl text-clay-ink dark:text-white hover:bg-clay-soft/50 flex items-center gap-2"
            >
              <MessageCircleQuestion size={14} />
              Doubts
              {doubtUnread > 0 && (
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-clay-accent text-white">
                  {doubtUnread}
                </span>
              )}
            </Link>
          )}
          <Link
            href="/signin"
            onClick={() => setOpen(false)}
            className="px-3 py-3 rounded-xl text-clay-accent font-semibold flex items-center gap-2"
          >
            {greet ? (
              <>
                {greet.icon}
                Hi, {greet.label}
              </>
            ) : (
              "Sign In"
            )}
          </Link>
          {streak !== null && (
            <div className="px-3 py-3 flex items-center gap-2">
              <StreakPill streak={streak} />
              <span className="text-xs text-clay-muted">
                {streak === 0
                  ? "Visit daily to start a streak"
                  : streak === 1
                    ? "Day 1 — keep going!"
                    : `${streak}-day streak 🔥`}
              </span>
            </div>
          )}
        </motion.div>
      )}
    </motion.header>
  );
}

function StreakPill({
  streak,
  compact,
}: {
  streak: number;
  compact?: boolean;
}) {
  const broken = streak === 0;
  const tooltip = broken
    ? "Visit any day to start a new streak"
    : streak === 1
      ? "Day 1 of your streak — return tomorrow to keep it!"
      : `${streak}-day visit streak — keep it going!`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      title={tooltip}
      aria-label={tooltip}
      className={`flex items-center gap-1.5 rounded-xl select-none ${
        compact ? "px-2 py-1.5" : "px-2.5 py-1.5"
      } ${
        broken
          ? "bg-clay-soft/70 dark:bg-white/5 text-clay-muted"
          : "bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-500/20 dark:to-red-500/20 text-orange-700 dark:text-orange-300"
      }`}
    >
      <motion.span
        animate={broken ? {} : { rotate: [0, -8, 8, 0] }}
        transition={broken ? {} : { duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
        className={`grid place-items-center w-6 h-6 rounded-lg ${
          broken
            ? "bg-clay-soft text-clay-muted"
            : "bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-clay-sm"
        }`}
      >
        <Flame size={12} />
      </motion.span>
      <span className="text-sm font-extrabold leading-none">{streak}</span>
      {!compact && (
        <span className="text-[10px] uppercase tracking-wide font-semibold leading-none">
          {streak === 1 ? "day" : "days"}
        </span>
      )}
    </motion.div>
  );
}
