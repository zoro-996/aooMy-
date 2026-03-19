"use client";

import { useEffect, useState } from "react";
import { ModulePage } from "@/components/module-page";
import { PageTransition } from "@/components/page-transition";
import { motion } from "framer-motion";

type Note = {
  id: string;
  date: string;
  title: string | null;
  content: string;
};

type Phase = "checking" | "setPin" | "verifyPin" | "unlocked";

export default function ArchiveClient() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [pinInput, setPinInput] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setError(null);
      const res = await fetch("/api/archive/pin", { cache: "no-store" });
      if (!res.ok) {
        setPhase("setPin");
        return;
      }
      const body = (await res.json().catch(() => null)) as { hasPin?: boolean } | null;
      setPhase(body?.hasPin ? "verifyPin" : "setPin");
    })();
  }, []);

  async function submitPin() {
    if (!/^\d{4}$/.test(pinInput)) {
      setError("PIN must be 4 digits.");
      return;
    }
    setError(null);
    setLoading(true);
    const res = await fetch("/api/archive/pin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pin: pinInput }),
    });
    const body = (await res.json().catch(() => null)) as { error?: string; ok?: boolean } | null;
    setLoading(false);
    if (!res.ok || !body?.ok) {
      setError(body?.error === "invalid_pin" ? "Incorrect PIN." : "Could not verify PIN.");
      return;
    }
    setPhase("unlocked");
    await loadNotes();
  }

  async function loadNotes() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/archive/notes", { cache: "no-store" });
    const body = (await res.json().catch(() => null)) as { notes?: Note[]; error?: string } | null;
    if (!res.ok) {
      setError(body?.error ?? "Failed to load notes.");
      setLoading(false);
      return;
    }
    setNotes(body?.notes ?? []);
    setLoading(false);
  }

  return (
    <PageTransition>
      <ModulePage
        moduleKey="archive"
        title="Archive"
        subtitle="Protected archive of your diary notes."
      >
        <div className="w-full flex items-center justify-center px-6 py-10">

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-4xl"
          >

            {/* GLASS CONTAINER */}
            <div className="rounded-[2rem] backdrop-blur-2xl bg-white/10 border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-8">

              {/* INNER DARK CARD */}
              <div className="bg-[#1F2937] rounded-[1.5rem] p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.5)]">

                {phase === "checking" ? (
                  <div className="text-sm text-gray-300">Checking archive…</div>

                ) : phase === "setPin" ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5 flex flex-col items-center text-center"
                  >
                    <div className="text-sm font-semibold text-white">
                      Set a 4-digit PIN to protect your archive.
                    </div>

                    <input
                      value={pinInput}
                      onChange={(e) =>
                        setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      className="w-32 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-center tracking-[0.4em] text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    />

                    {error && (
                      <div className="text-xs text-red-400">{error}</div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => void submitPin()}
                      disabled={loading}
                      className="flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
                    >
                      ☰ {loading ? "Saving…" : "Save PIN"}
                    </motion.button>
                  </motion.div>

                ) : phase === "verifyPin" ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5 flex flex-col items-center text-center"
                  >
                    <div className="text-sm font-semibold text-white">
                      Enter your 4-digit PIN.
                    </div>

                    <input
                      value={pinInput}
                      onChange={(e) =>
                        setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      className="w-32 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-center tracking-[0.4em] text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    />

                    {error && (
                      <div className="text-xs text-red-400">{error}</div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => void submitPin()}
                      disabled={loading}
                      className="flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
                    >
                      ☰ {loading ? "Checking…" : "Unlock"}
                    </motion.button>
                  </motion.div>

                ) : (
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-sm text-gray-300">Loading notes…</div>
                    ) : notes.length === 0 ? (
                      <div className="text-sm text-gray-300 text-center">
                        No notes archived yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {notes.map((n) => (
                          <motion.div
                            key={n.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm backdrop-blur-md shadow-[0_6px_20px_rgba(0,0,0,0.4)]"
                          >
                            <div className="text-xs font-semibold text-gray-400">
                              {new Date(n.date).toISOString().slice(0, 10)}
                            </div>

                            {n.title && (
                              <div className="mt-1 font-semibold text-white">
                                {n.title}
                              </div>
                            )}

                            <div className="mt-1 text-xs text-gray-300 whitespace-pre-wrap">
                              {n.content}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        </div>
      </ModulePage>
    </PageTransition>
  );
}