"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

type Testimonial = {
  id: string;
  name: string;
  classId?: string;
  rating?: number;
  text: string;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
  approvedAt?: number;
};

type Counts = {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
};

type Filter = "all" | "pending" | "approved" | "rejected";

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("pending");

  const refresh = async () => {
    const res = await fetch("/api/admin/testimonials");
    const data = await res.json();
    setItems(data.testimonials || []);
    setCounts(data.counts || null);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const act = async (id: string, action: "approved" | "rejected" | "pending") => {
    await fetch(`/api/admin/testimonials/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this testimonial permanently?")) return;
    await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    refresh();
  };

  if (loading) {
    return (
      <div className="clay p-10 text-center text-clay-muted">
        <Loader2 className="mx-auto animate-spin" />
      </div>
    );
  }

  const filtered = items.filter((t) =>
    filter === "all" ? true : t.status === filter,
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <Tile
          label="Pending"
          value={String(counts?.pending ?? 0)}
          icon={<Clock size={18} />}
          tone="amber"
        />
        <Tile
          label="Approved"
          value={String(counts?.approved ?? 0)}
          icon={<CheckCircle2 size={18} />}
          tone="emerald"
        />
        <Tile
          label="Total"
          value={String(counts?.total ?? 0)}
          icon={<Star size={18} />}
          tone="blue"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize ${
              filter === f
                ? "clay-btn-primary"
                : "clay-btn-secondary text-clay-ink dark:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="clay p-10 text-center text-sm text-clay-muted">
          {filter === "pending"
            ? "Nothing waiting for review."
            : "Nothing here yet."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <div key={t.id} className="clay p-4 sm:p-5">
              <div className="flex items-start gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-clay-ink dark:text-white">
                      {t.name}
                    </span>
                    {t.classId && (
                      <span className="text-xs text-clay-muted">
                        · Class {t.classId}
                      </span>
                    )}
                    <StatusPill status={t.status} />
                  </div>
                  {t.rating && (
                    <div className="flex items-center gap-0.5 mt-1.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          size={12}
                          className={
                            j < (t.rating ?? 0)
                              ? "fill-amber-400 text-amber-400"
                              : "text-clay-muted/30"
                          }
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-clay-ink dark:text-white mt-2 leading-relaxed whitespace-pre-wrap">
                    {t.text}
                  </p>
                  <p className="text-[10px] text-clay-muted mt-2">
                    Submitted {new Date(t.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {t.status !== "approved" && (
                  <button
                    onClick={() => act(t.id, "approved")}
                    className="clay-btn-secondary text-xs text-emerald-600"
                  >
                    <CheckCircle2 size={14} /> Approve
                  </button>
                )}
                {t.status !== "rejected" && (
                  <button
                    onClick={() => act(t.id, "rejected")}
                    className="clay-btn-secondary text-xs text-orange-600"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                )}
                {t.status !== "pending" && (
                  <button
                    onClick={() => act(t.id, "pending")}
                    className="clay-btn-secondary text-xs"
                  >
                    <Clock size={14} /> Move to Pending
                  </button>
                )}
                <button
                  onClick={() => remove(t.id)}
                  className="clay-btn-secondary text-xs text-red-500"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function StatusPill({ status }: { status: Testimonial["status"] }) {
  const tone =
    status === "approved"
      ? "bg-emerald-100 text-emerald-700"
      : status === "rejected"
        ? "bg-orange-100 text-orange-700"
        : "bg-amber-100 text-amber-700";
  return (
    <span
      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${tone}`}
    >
      {status}
    </span>
  );
}

function Tile({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "amber" | "emerald" | "blue";
}) {
  const cls =
    tone === "amber"
      ? "from-amber-100 to-orange-200 text-orange-600"
      : tone === "emerald"
        ? "from-emerald-100 to-emerald-200 text-emerald-700"
        : "from-blue-100 to-blue-300 text-clay-accentDeep";
  return (
    <div className="clay p-4 flex items-center gap-3">
      <div
        className={`w-11 h-11 rounded-2xl bg-gradient-to-br grid place-items-center shadow-clay-sm ${cls}`}
      >
        {icon}
      </div>
      <div>
        <div className="display font-bold text-clay-ink dark:text-white text-lg leading-none">
          {value}
        </div>
        <div className="text-[11px] text-clay-muted uppercase tracking-wide mt-1">
          {label}
        </div>
      </div>
    </div>
  );
}
