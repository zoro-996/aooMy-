"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setSubmitting(false);
      if (body?.error === "email_in_use") {
        setError("That email is already registered.");
      } else {
        setError("Account creation failed. Try again.");
      }
      return;
    }

    // Auto-login after successful signup
    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/app",
    });

    setSubmitting(false);
    if (!signInRes || signInRes.error) {
      router.push("/login");
      return;
    }

    router.push(signInRes.url ?? "/app");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_30px_80px_rgba(0,0,0,0.35)] p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
          <p className="mt-1 text-sm text-white/70">
            Your tasks, diary notes, files, and AI — under one login.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <div className="text-xs font-medium text-white/70">Name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              autoComplete="name"
              required
              className="mt-1 w-full rounded-xl bg-white/10 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-300/60"
              placeholder="Name"
            />
          </label>

          <label className="block">
            <div className="text-xs font-medium text-white/70">Email</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
              className="mt-1 w-full rounded-xl bg-white/10 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-cyan-300/60"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <div className="text-xs font-medium text-white/70">Password</div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              className="mt-1 w-full rounded-xl bg-white/10 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-fuchsia-300/60"
              placeholder="At least 6 characters"
            />
          </label>

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <button
            disabled={submitting}
            className="w-full rounded-xl bg-white text-black font-semibold py-3 transition hover:bg-white/90 disabled:opacity-60"
            type="submit"
          >
            {submitting ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="mt-6 text-sm text-white/70">
          Already have an account?{" "}
          <Link className="text-white underline underline-offset-4" href="/login">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

