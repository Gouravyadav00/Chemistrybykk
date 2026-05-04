"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Send, Star } from "lucide-react";
import { useState } from "react";

export default function TestimonialSubmit() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="clay-sm p-4 text-sm text-clay-ink dark:text-white flex items-center gap-2">
        <CheckCircle2 className="text-emerald-500" size={18} />
        Thanks for sharing! Khyati will review and publish it soon.
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="clay-btn-secondary text-xs"
      >
        <Star size={12} /> Share your experience
      </button>
    );
  }

  const submit = async () => {
    setError(null);
    if (text.trim().length < 20) {
      setError("Please write at least 20 characters.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, rating }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error ?? "Couldn't submit.");
      return;
    }
    setDone(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="clay-sm p-4 text-left"
    >
      <p className="text-xs font-semibold text-clay-ink dark:text-white mb-2 flex items-center gap-1.5">
        <Star size={14} className="text-amber-400" /> Share your experience
      </p>
      <div className="flex items-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            aria-label={`${n} stars`}
          >
            <Star
              size={20}
              className={
                n <= rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-clay-muted/40"
              }
            />
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        maxLength={800}
        placeholder="What's your experience been like? (Min 20 characters; will be reviewed before going live.)"
        className="clay-inset w-full px-3 py-2 text-sm rounded-2xl bg-transparent outline-none text-clay-ink dark:text-white placeholder:text-clay-muted resize-y mb-2"
      />
      {error && (
        <div className="text-xs text-red-500 font-medium mb-2">{error}</div>
      )}
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={submitting}
          className="clay-btn-primary text-xs disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Send size={12} />
          )}
          Submit
        </button>
        <button
          onClick={() => setOpen(false)}
          className="clay-btn-secondary text-xs"
        >
          Cancel
        </button>
      </div>
      <p className="text-[10px] text-clay-muted mt-2">
        Your testimonial will only appear publicly after Khyati approves it.
      </p>
    </motion.div>
  );
}
