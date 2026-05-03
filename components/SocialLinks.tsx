"use client";

import { motion } from "framer-motion";
import { Instagram, Linkedin, Send, Youtube } from "lucide-react";

const socials = [
  {
    name: "YouTube",
    handle: "@KhyatiKaushik-p4c",
    href: "https://www.youtube.com/@KhyatiKaushik-p4c",
    icon: Youtube,
    color: "from-red-400 to-red-600",
  },
  {
    name: "LinkedIn",
    handle: "Khyati Kaushik",
    href: "https://www.linkedin.com/in/khyati-kaushik-8849bb205/",
    icon: Linkedin,
    color: "from-sky-500 to-blue-700",
  },
  {
    name: "Instagram",
    handle: "@chemistrybykk",
    href: "https://www.instagram.com/chemistrybykk/",
    icon: Instagram,
    color: "from-pink-400 to-fuchsia-600",
  },
];

export default function SocialLinks() {
  return (
    <section id="connect" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 clay-sm px-4 py-2 mb-4 text-sm text-clay-accent font-semibold">
          <Send size={14} /> Stay Connected
        </div>
        <h2 className="display text-3xl sm:text-4xl font-extrabold text-clay-ink dark:text-white">
          Follow along — daily Chemistry, simplified.
        </h2>
        <p className="mt-3 text-clay-muted">
          Watch the YouTube walkthroughs, ask doubts on Instagram, and connect
          professionally on LinkedIn.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        {socials.map((s, i) => (
          <motion.a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -6 }}
            className="clay p-6 flex items-center gap-4"
          >
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} grid place-items-center text-white shadow-clay-sm`}
            >
              <s.icon size={22} />
            </div>
            <div>
              <div className="display font-bold text-clay-ink dark:text-white">
                {s.name}
              </div>
              <div className="text-sm text-clay-muted">{s.handle}</div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
