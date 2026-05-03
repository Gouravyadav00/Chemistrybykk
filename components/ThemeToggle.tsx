"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="clay-sm w-11 h-11 flex items-center justify-center text-clay-accent hover:text-clay-accentDeep dark:text-clay-mint"
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </motion.div>
    </button>
  );
}
