"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useEffect, useState } from "react";

type Testimonial = {
  id: string;
  name: string;
  classId?: string;
  rating?: number;
  text: string;
};

export default function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.testimonials || []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  // Section is hidden entirely until at least one testimonial is approved
  if (!loaded || items.length === 0) return null;

  return (
    <section
      id="voices"
      className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24"
    >
      <div className="text-center mb-10">
        <p className="text-clay-accent font-bold text-xs uppercase tracking-widest mb-2">
          Student Voices
        </p>
        <h2 className="display text-3xl sm:text-4xl font-extrabold text-clay-ink dark:text-white">
          What students are saying
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: i * 0.05 }}
            className="clay p-5 flex flex-col"
          >
            <Quote
              size={22}
              className="text-clay-accent/60 flex-shrink-0 mb-3"
            />
            <p className="text-sm text-clay-ink dark:text-white leading-relaxed flex-1 whitespace-pre-wrap">
              {t.text}
            </p>
            {t.rating && (
              <div className="mt-4 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    size={14}
                    className={
                      j < (t.rating ?? 0)
                        ? "fill-amber-400 text-amber-400"
                        : "text-clay-muted/40"
                    }
                  />
                ))}
              </div>
            )}
            <div className="mt-3 text-xs">
              <span className="font-semibold text-clay-ink dark:text-white">
                {t.name}
              </span>
              {t.classId && (
                <span className="text-clay-muted"> · Class {t.classId}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
