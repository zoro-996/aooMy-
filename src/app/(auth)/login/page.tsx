"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") ?? "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setSubmitting(false);

    if (!res || res.error) {
      setError("Login failed. Check email/password.");
      return;
    }

    router.push(res.url ?? "/app");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] relative overflow-hidden">

      {/* 🔥 Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-fuchsia-500/20 blur-3xl rounded-full top-10 left-10 animate-pulse" />
      <div className="absolute w-[400px] h-[400px] bg-cyan-400/20 blur-3xl rounded-full bottom-10 right-10 animate-pulse" />

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_30px_80px_rgba(0,0,0,0.5)] p-6 relative z-10">

        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Sign in to your PrismDay workspace.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">

          {/* EMAIL */}
          <label className="block">
            <div className="text-xs font-medium text-white/70">Email</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
              className="mt-1 w-full rounded-xl bg-white/10 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-cyan-400/70 transition"
              placeholder="you@example.com"
            />
          </label>

          {/* PASSWORD */}
          <label className="block">
            <div className="text-xs font-medium text-white/70">Password</div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 w-full rounded-xl bg-white/10 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-fuchsia-400/70 transition"
              placeholder="••••••••"
            />
          </label>

          {/* ERROR */}
          {error ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {/* BUTTON */}
          <button
            disabled={submitting}
            className="w-full rounded-xl font-semibold py-3 text-white bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-500 hover:opacity-90 transition disabled:opacity-60 shadow-lg shadow-purple-500/20"
            type="submit"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-white/70">
          No account?{" "}
          <Link
            className="text-transparent bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text font-semibold underline underline-offset-4"
            href="/register"
          >
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginInner />
    </Suspense>
  );
}
