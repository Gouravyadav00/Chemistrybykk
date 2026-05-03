"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  AtSign,
  Bell,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  LogOut,
  School,
  Sparkles,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import AdminDashboard from "@/components/AdminDashboard";

type Whoami =
  | { role: "guest" }
  | { role: "subscriber"; subscriber: { email: string; name?: string; class?: string } }
  | { role: "admin" };

export default function SignInPage() {
  const [me, setMe] = useState<Whoami | null>(null);

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe({ role: "guest" }));
  }, []);

  return (
    <main className="min-h-screen px-4 sm:px-6 py-8 relative">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-72 h-72 clay-blob alt opacity-50 animate-floatSlow" />
        <div className="absolute bottom-10 -right-10 w-80 h-80 clay-blob opacity-40 animate-float" />
      </div>

      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-clay-accent font-semibold mb-6"
        >
          <ArrowLeft size={16} /> Back to Site
        </Link>

        {me?.role === "admin" ? (
          <AdminDashboard
            onLogout={async () => {
              await fetch("/api/auth", { method: "DELETE" });
              setMe({ role: "guest" });
            }}
          />
        ) : me?.role === "subscriber" ? (
          <SignedInCard
            subscriber={me.subscriber}
            onSignOut={async () => {
              await fetch("/api/auth", { method: "DELETE" });
              setMe({ role: "guest" });
            }}
          />
        ) : (
          <SignInCard onAdmin={() => setMe({ role: "admin" })} />
        )}
      </div>
    </main>
  );
}

function SignInCard({ onAdmin }: { onAdmin: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [school, setSchool] = useState("");
  const [exam, setExam] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<null | "added" | "exists">(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          email,
          password: pass,
          name,
          studentClass,
          school,
          exam,
          city,
          phone,
          interest,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "Couldn't sign you in. Please try again.");
        return;
      }
      if (data.role === "admin") {
        onAdmin();
        return;
      }
      setDone(data.status === "added" ? "added" : "exists");
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <SuccessCard
        kind={done}
        email={email}
        onReset={() => {
          setDone(null);
          setName("");
          setEmail("");
          setPass("");
        }}
      />
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="inline-flex items-center gap-2 clay-sm px-3 py-1.5 mb-4 text-xs text-clay-accent font-bold uppercase tracking-wide">
          <Bell size={12} /> Updates & Notifications
        </div>
        <h1 className="display text-4xl sm:text-5xl font-extrabold text-clay-ink dark:text-white">
          Stay in the <span className="text-clay-accent">loop</span>.
        </h1>
        <p className="mt-3 text-clay-muted">
          Sign in to get notified the moment new notes, cheatsheets, tips and
          YouTube walkthroughs go live. No spam — just chapter drops.
        </p>

        <ul className="mt-6 space-y-2 text-sm text-clay-muted">
          <Bullet>Personalised by your class — only what's relevant</Bullet>
          <Bullet>New chapter notes & cheatsheets first</Bullet>
          <Bullet>Last-minute board exam revision tips</Bullet>
          <Bullet>YouTube walkthrough release alerts</Bullet>
        </ul>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        onSubmit={submit}
        className="clay p-7"
      >
        <div className="flex items-center gap-3 mb-6">
          <Logo size="lg" />
          <div>
            <div className="display font-bold text-clay-ink dark:text-white">
              ChemistryByKK
            </div>
            <div className="text-xs text-clay-muted">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </div>
          </div>
        </div>

        <div className="clay-inset p-1 inline-flex gap-1 rounded-2xl mb-5 w-full">
          <ModeTab
            active={mode === "signup"}
            onClick={() => setMode("signup")}
            label="Create Account"
          />
          <ModeTab
            active={mode === "signin"}
            onClick={() => setMode("signin")}
            label="Sign In"
          />
        </div>

        {mode === "signup" && (
          <Field label="Your Name" icon={<User size={16} />}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              className="bg-transparent outline-none w-full text-sm text-clay-ink dark:text-white"
            />
          </Field>
        )}

        <Field label="Email or Username" icon={<AtSign size={16} />}>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="username"
            required
            className="bg-transparent outline-none w-full text-sm text-clay-ink dark:text-white"
          />
        </Field>

        <Field label="Password" icon={<Lock size={16} />}>
          <input
            type={show ? "text" : "password"}
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="••••••••"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            className="bg-transparent outline-none w-full text-sm text-clay-ink dark:text-white"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="text-clay-muted"
            aria-label="Toggle password visibility"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </Field>

        {mode === "signup" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Class" icon={<GraduationCap size={16} />}>
                <select
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="bg-transparent outline-none w-full text-sm text-clay-ink dark:text-white appearance-none cursor-pointer"
                >
                  <option value="">Select…</option>
                  <option value="9">Class 9</option>
                  <option value="10">Class 10</option>
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                  <option value="Dropper">Dropper / Repeater</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
              <Field label="Target Exam" icon={<Sparkles size={16} />}>
                <select
                  value={exam}
                  onChange={(e) => setExam(e.target.value)}
                  className="bg-transparent outline-none w-full text-sm text-clay-ink dark:text-white appearance-none cursor-pointer"
                >
                  <option value="">Skip</option>
                  <option value="CBSE Boards">CBSE Boards</option>
                  <option value="JEE">JEE</option>
                  <option value="NEET">NEET</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
            </div>

            <Field label="School (optional)" icon={<School size={16} />}>
              <input
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Skip if you'd rather not share"
                className="bg-transparent outline-none w-full text-sm text-clay-ink dark:text-white"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="City (optional)">
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Bhiwadi…"
                  className="bg-transparent outline-none w-full text-sm text-clay-ink dark:text-white"
                />
              </Field>
              <Field label="Phone (optional)">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 …"
                  inputMode="tel"
                  className="bg-transparent outline-none w-full text-sm text-clay-ink dark:text-white"
                />
              </Field>
            </div>

            <Field label="What interests you most? (optional)">
              <select
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="bg-transparent outline-none w-full text-sm text-clay-ink dark:text-white appearance-none cursor-pointer"
              >
                <option value="">Skip</option>
                <option value="Organic">Organic Chemistry</option>
                <option value="Inorganic">Inorganic Chemistry</option>
                <option value="Physical">Physical Chemistry</option>
                <option value="All">Everything</option>
              </select>
            </Field>
          </>
        )}

        {err && (
          <div className="mt-4 text-sm text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-xl">
            {err}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="clay-btn-primary w-full mt-6"
        >
          {loading
            ? "Please wait…"
            : mode === "signup"
              ? "Create Account"
              : "Sign In"}
        </button>

        <p className="text-[11px] text-clay-muted text-center mt-4">
          By continuing you agree to receive update notifications. Your details
          are stored securely and never sold.
        </p>
      </motion.form>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <label className="text-xs font-semibold text-clay-muted">{label}</label>
      <div className="clay-inset flex items-center gap-2 px-4 py-3 mt-1.5">
        {icon && <span className="text-clay-muted">{icon}</span>}
        {children}
      </div>
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition ${
        active
          ? "clay-btn-primary"
          : "text-clay-muted hover:text-clay-ink dark:hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 size={16} className="text-clay-accent mt-0.5 flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}

function SignedInCard({
  subscriber,
  onSignOut,
}: {
  subscriber: { email: string; name?: string; class?: string };
  onSignOut: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto clay p-8 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-blue-200 to-blue-500 grid place-items-center text-white shadow-clay-sm mb-5"
      >
        <Sparkles size={28} />
      </motion.div>
      <h2 className="display text-2xl font-extrabold text-clay-ink dark:text-white">
        You're signed in {subscriber.name ? `, ${subscriber.name}` : ""} 👋
      </h2>
      <p className="mt-2 text-sm text-clay-muted">
        We'll send you a heads-up when fresh notes, cheatsheets or videos drop.
      </p>
      <div className="clay-sm mt-5 px-4 py-2 inline-flex items-center gap-2 text-xs">
        <AtSign size={14} className="text-clay-accent" />
        <span className="text-clay-ink dark:text-white font-medium">
          {subscriber.email}
        </span>
        {subscriber.class && (
          <span className="ml-1 text-clay-muted">· Class {subscriber.class}</span>
        )}
      </div>
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        <Link href="/#learn" className="clay-btn-primary text-sm">
          Continue Learning
        </Link>
        <button onClick={onSignOut} className="clay-btn-secondary text-sm">
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </motion.div>
  );
}

function SuccessCard({
  kind,
  email,
  onReset,
}: {
  kind: "added" | "exists";
  email: string;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto clay p-8 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-blue-200 to-blue-500 grid place-items-center text-white shadow-clay-sm mb-5"
      >
        <Sparkles size={28} />
      </motion.div>
      <h2 className="display text-2xl font-extrabold text-clay-ink dark:text-white">
        {kind === "added" ? "You're in! 🎉" : "Welcome back!"}
      </h2>
      <p className="mt-2 text-sm text-clay-muted">
        {kind === "added"
          ? "We'll send a heads-up when fresh notes, cheatsheets or videos drop."
          : "You're already on the list — we'll keep you in the loop."}
      </p>
      <div className="clay-sm mt-5 px-4 py-2 inline-flex items-center gap-2 text-xs">
        <AtSign size={14} className="text-clay-accent" />
        <span className="text-clay-ink dark:text-white font-medium">{email}</span>
      </div>
      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        <Link href="/#learn" className="clay-btn-primary text-sm">
          Start Reading
        </Link>
        <button onClick={onReset} className="clay-btn-secondary text-sm">
          Use another account
        </button>
      </div>
    </motion.div>
  );
}
