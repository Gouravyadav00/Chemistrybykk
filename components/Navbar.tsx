"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

const links = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#learn", label: "Learning Hub" },
  { href: "#connect", label: "Connect" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 60], [0, -2]);

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
          <Link
            href="/signin"
            className="px-3 py-2 rounded-xl text-sm font-semibold text-clay-accent"
          >
            Sign In
          </Link>
        </nav>

        <div className="flex items-center gap-2">
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
          <Link
            href="/signin"
            className="px-3 py-3 rounded-xl text-clay-accent font-semibold"
          >
            Sign In
          </Link>
        </motion.div>
      )}
    </motion.header>
  );
}
